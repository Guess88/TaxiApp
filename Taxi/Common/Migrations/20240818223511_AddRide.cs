using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Common.Migrations
{
    /// <inheritdoc />
    public partial class AddRide : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ride",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DriverId = table.Column<int>(type: "int", nullable: true),
                    StartAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EndAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedWaitTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsRated = table.Column<bool>(type: "bit", nullable: false),
                    UserRating = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ride", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ride");
        }
    }
}
