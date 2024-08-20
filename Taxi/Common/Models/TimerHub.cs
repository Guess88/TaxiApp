using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public sealed class TimerHub : Hub
    {
        internal static IHubCallerClients MyClients { get; set; } //To Access the clients in other classes and timers
        public override Task OnConnectedAsync()
        {
            MyClients ??= Clients;
            return base.OnConnectedAsync();
        }

        public int MethodOnServer(int rideId, TimeSpan timeRemaining, TimeSpan timeRemainingTravel)
        {
            var connectionID = Context.ConnectionId;

            MyClients.Client(connectionID).SendAsync("MethodNameOnClient", rideId, timeRemaining, timeRemainingTravel);

            return 10;
        }
        //public async Task SendCountdownToUser(int rideId, TimeSpan timeRemaining)
        //{
        //    try
        //    {
        //        await Clients.All.SendAsync("SendCountdownToUser", rideId, timeRemaining);
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log the exception (you can use a logging framework or simply Console.WriteLine for testing)
        //        Console.WriteLine($"Error in SendCountdownToUser: {ex.Message}");
        //        throw; // Rethrow the exception to propagate it to the client
        //    }
        //}

        //public async Task SendCountdownToDriver(int rideId, TimeSpan timeRemaining)
        //{
        //    await Clients.User(Context.UserIdentifier).SendAsync("ReceiveDriverCountdown", rideId, timeRemaining);

        //}

        //public override async Task OnConnectedAsync()
        //{
        //    await Clients.All.SendAsync("ReciveMessage", $"{Context.ConnectionId} has joined!");
        //}

    }
}
