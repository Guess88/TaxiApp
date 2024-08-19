using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    [Table("Ride")]
    public class Ride
    {
        [Key]
        public int Id { get; set; }

        // Veza sa korisnikom (koji je naručio vožnju)
        public int UserId { get; set; }

        // Veza sa vozačem (koji prihvatio vožnju)
        public int? DriverId { get; set; }

        // Početna adresa
        public string StartAddress { get; set; }

        // Krajnja adresa
        public string EndAddress { get; set; }

        // Predviđena cena vožnje
        public decimal EstimatedCost { get; set; }

        // Predviđeno vreme čekanja
        public TimeSpan EstimatedWaitTime { get; set; }


        // Status vožnje (npr. Kreirana, U toku, Završena, Otkazana)
        public DrivingStatus Status { get; set; }

        // Da li je vožnja ocenjena
        public bool IsRated { get; set; }

        // Ocena vozača od strane korisnika
        public int? UserRating { get; set; }


        // Vreme kada je vožnja kreirana
        public DateTime CreatedAt { get; set; }

        // Vreme kada je vožnja završena
        public DateTime? CompletedAt { get; set; }
    }
    public enum DrivingStatus
    {
        Created,
        InProgress,
        Completed,
        Cancelled
    }
}

