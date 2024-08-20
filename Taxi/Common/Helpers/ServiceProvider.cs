using Common.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Helpers
{
    public class ServiceProvider : IServiceProvider
    {
        private readonly IHubContext<TimerHub> _hubContext;

        public ServiceProvider(IHubContext<TimerHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public object GetService(Type serviceType)
        {
            if (serviceType == typeof(IHubContext<TimerHub>))
            {
                return _hubContext;
            }

            throw new ArgumentException("Service not found", nameof(serviceType));
        }
    }
}
