using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.DB;
using Common.Interfaces;
using Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.AspNetCore.SignalR;

namespace DrivingService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    public sealed class DrivingService : StatefulService, IDrive
    {
        private readonly TaxiDbContext _context;
        private IReliableDictionary<int, Ride> _pendingRides;

        public DrivingService(StatefulServiceContext context)
            : base(context)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TaxiDbContext>();
            optionsBuilder.UseSqlServer("Data Source=DESKTOP-53QCKGT\\SQLEXPRESS;Initial Catalog=taxi;Integrated Security=True;TrustServerCertificate=True;");

            _context = new TaxiDbContext(optionsBuilder.Options);
        }


        public async Task<Ride> CreateRide(int userId, string startAddress, string endAddress, decimal estimatedCost, TimeSpan estimatedWaitTime)
        {
            var ride = new Ride
            {
                UserId = userId,
                StartAddress = startAddress,
                EndAddress = endAddress,
                EstimatedCost = estimatedCost,
                EstimatedWaitTime = estimatedWaitTime,
                Status = DrivingStatus.Created,
                CreatedAt = DateTime.Now
            };

            var user = await _context.Users.FindAsync(userId);
            user.IsRideCreated = true;
            _context.Users.Update(user);

            _context.Rides.Add(ride);
            await _context.SaveChangesAsync();

            return ride;
        }

        public async Task<Ride> ConfirmRide(int rideId)
        {
            var ride = await _context.Rides.FindAsync(rideId);

            if (ride == null || ride.Status != DrivingStatus.Created)
            {
                throw new InvalidOperationException("Ride not found or already confirmed.");
            }

            ride.Status = DrivingStatus.WaitingForAccept;

            ride.EstimatedTravelTime = TimeSpan.FromMinutes(new Random().Next(1,1)); 

            await _context.SaveChangesAsync();

            await AddRideToPendingList(ride);


            return ride;
        }



        public async Task AddRideToPendingList(Ride ride)
        {
            using (var tx = this.StateManager.CreateTransaction())
            {
                _pendingRides = await this.StateManager.GetOrAddAsync<IReliableDictionary<int, Ride>>("pendingRides");

                await _pendingRides.AddAsync(tx, ride.Id, ride);
                await tx.CommitAsync();
            }

           
        }

        //Od strane vozaca
        public async Task AcceptRide(int driverId, int rideId)
        {

            using (var tx = this.StateManager.CreateTransaction())
            {
               

                var rideResult = await _pendingRides.TryGetValueAsync(tx, rideId);

                if (rideResult.HasValue)
                {
                    var ride = rideResult.Value;
                    ride.DriverId = driverId;
                    ride.Status = DrivingStatus.InProgress;

                    var driver = await _context.Users.FindAsync(driverId);
                    var user = await _context.Users.FindAsync(ride.UserId);

                    driver.IsRideAccepted = true;
                    user.IsRideAccepted = true;

                    _context.Rides.Update(ride);

                    _context.Users.Update(driver);
                    _context.Users.Update(user);

                    await _context.SaveChangesAsync();

                    

                    await _pendingRides.TryRemoveAsync(tx, rideId);

                    await tx.CommitAsync();


                }
            }
        }


        public async Task RateDriver(int driverId, int rating,int rideId,int userId)
        {
            if (rating < 1 || rating > 5)
            {
                throw new ArgumentException("Rating must be between 1 and 5.");
            }

            var driver = await _context.Users.FindAsync(driverId);
            var user = await _context.Users.FindAsync(userId);

            if (driver == null)
            {
                throw new InvalidOperationException("Driver not found.");
            }

            // Update the driver's rating
            driver.RatingCount++;
            driver.RatingTotal += rating;

            user.IsRideCreated = false;

            var ride = await _context.Rides.FindAsync(rideId);
            ride.Status = DrivingStatus.Completed;
            ride.CompletedAt = DateTime.Now;


            _context.Users.Update(driver);
            _context.Users.Update(user);
            _context.Rides.Update(ride);

            //await _hubContext.Clients.User(user.Id.ToString())
            //    .SendAsync("ReceiveCountdown", rideId, ride.EstimatedTravelTime);

            await _context.SaveChangesAsync();
        }

        public async Task<List<Ride>> GetPreviousRides(int userId)
        {
            return await _context.Rides
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt) 
                .ToListAsync();
        }

        public async Task<decimal> GetDriverAverageRating(int driverId)
        {
            var driver = await _context.Users.FindAsync(driverId);

            if (driver == null)
            {
                throw new InvalidOperationException("Driver not found.");
            }

            if (driver.RatingCount == 0)
            {
                return 0; // No ratings yet
            }

            return (decimal)driver.RatingTotal / driver.RatingCount;
        }

        public async Task BlockDriver(int driverId)
        {
            var driver = await _context.Users.FindAsync(driverId);

            if (driver == null)
            {
                throw new InvalidOperationException("Driver not found.");
            }

            driver.IsBlocked = true;
            _context.Users.Update(driver);
            await _context.SaveChangesAsync();
        }

        public async Task UnblockDriver(int driverId)
        {
            var driver = await _context.Users.FindAsync(driverId);

            if (driver == null)
            {
                throw new InvalidOperationException("Driver not found.");
            }

            driver.IsBlocked = false;
            _context.Users.Update(driver);
            await _context.SaveChangesAsync();
        }





        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            var myDictionary = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, long>>("myDictionary");

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var result = await myDictionary.TryGetValueAsync(tx, "Counter");

                    ServiceEventSource.Current.ServiceMessage(this.Context, "Current Counter Value: {0}",
                        result.HasValue ? result.Value.ToString() : "Value does not exist.");

                    await myDictionary.AddOrUpdateAsync(tx, "Counter", 0, (key, value) => ++value);

                    // If an exception is thrown before calling CommitAsync, the transaction aborts, all changes are 
                    // discarded, and nothing is saved to the secondary replicas.
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
