using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Common.Migrations
{
    /// <inheritdoc />
    public partial class AddVerifcationAndBlockFileds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBlocked",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsVerificated",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBlocked",
                table: "User");

            migrationBuilder.DropColumn(
                name: "IsVerificated",
                table: "User");
        }
    }
}
