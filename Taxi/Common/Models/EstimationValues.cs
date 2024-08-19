using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class EstimationValues
    {
        public decimal Cost { get; set; }           // Procijenjena cijena vožnje
        public TimeSpan WaitTime { get; set; }      // Procijenjeno vrijeme čekanja

        public EstimationValues() { }

        public EstimationValues(decimal cost, TimeSpan waitTime)
        {
            Cost = cost;
            WaitTime = waitTime;
        }

        
    }
}
