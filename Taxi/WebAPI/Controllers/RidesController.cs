using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Common.DB;
using Common.Models;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Fabric;
using Common.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RidesController : ControllerBase
    {
        private readonly TaxiDbContext _context;

        public RidesController(TaxiDbContext context)
        {
            _context = context;
    }

        [HttpPost]
        public async Task<IActionResult> CreateRide([FromBody] RideRequestDTO rideRequest)
        {
            try
            {
                var proxy = ServiceProxy.Create<IEstimation>(new Uri("fabric:/Taxi/Estimation"));
                var estimation = await proxy.CalculateEstimation(rideRequest.StartAddress, rideRequest.EndAddress);
                

                if (estimation != null && estimation.Cost > 0 && estimation.WaitTime > TimeSpan.Zero)
                {
                    var proxy2 = ServiceProxy.Create<IDrive>(new Uri("fabric:/Taxi/DrivingService"), new ServicePartitionKey(0));
                    var ride = await proxy2.CreateRide(rideRequest.UserId, rideRequest.StartAddress, rideRequest.EndAddress, estimation.Cost, estimation.WaitTime);



                    return Ok(ride);
                }
                else
                {
                    return BadRequest("Unable to estimate cost or wait time.");
                }
            }
            catch(Exception ex)
    {
                // Log the exception or return it in the response for debugging purposes
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}