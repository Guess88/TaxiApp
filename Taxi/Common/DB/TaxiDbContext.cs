using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Models;

namespace Common.DB
{
    public class TaxiDbContext : DbContext
    {
        public TaxiDbContext(DbContextOptions<TaxiDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }
    public class TaxiDbContextFactory : IDesignTimeDbContextFactory<TaxiDbContext>
    {
        public TaxiDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TaxiDbContext>();
            optionsBuilder.UseSqlServer("Data Source=DESKTOP-53QCKGT\\SQLEXPRESS;Initial Catalog=taxi;Integrated Security=True;TrustServerCertificate=True;");

            return new TaxiDbContext(optionsBuilder.Options);
        }
    }

}
