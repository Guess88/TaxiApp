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

namespace DrivingService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    public sealed class DrivingService : StatefulService, IDrive
    {
        private readonly TaxiDbContext _context;
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

            _context.Rides.Add(ride);
            await _context.SaveChangesAsync();

            return ride;
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
