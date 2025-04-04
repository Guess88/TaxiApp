﻿using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Common.Interfaces
{ 
    public interface IEstimation : IService
    {
        Task<EstimationValues> CalculateEstimation(string startAddress, string endAddress);
    }
}
