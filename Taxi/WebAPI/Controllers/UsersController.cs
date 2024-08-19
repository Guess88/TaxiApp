using Common.DB;
using Common.Interfaces;
using Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace WebAPI.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly TaxiDbContext _context;
        private readonly Jwt _jwt;

        public UsersController(TaxiDbContext context, IOptions<Jwt> jwt)
        {
            _context = context;
            _jwt = jwt.Value;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }


        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.Id }, user);
        }

        //[Authorize(Roles = "Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        [HttpPost("Login")]
        public async Task<ActionResult<UserWithToken>> Login([FromBody] LoginUserDTO loginUser)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(loginUser.PasswordHash));
                loginUser.PasswordHash = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }

            var user = await _context.Users
                     .Where(u => u.Email == loginUser.Email
                             && u.PasswordHash == loginUser.PasswordHash)
                     .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            UserWithToken userWithToken = new UserWithToken(user);

            if (userWithToken == null)
            {
                return NotFound();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwt.Key);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                 new Claim(ClaimTypes.Name, user.Email),
                 new Claim(ClaimTypes.Role, user.UserType.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            userWithToken.AccessToken = tokenHandler.WriteToken(token);


            return userWithToken;
        }

        
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromForm] UserRegistrationDto model)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest("User with this email already exists.");
            }

            // Hashiranje lozinke pomoću SHA256
            using (var sha256 = SHA256.Create())
            {
                var passwordBytes = Encoding.UTF8.GetBytes(model.Password);
                var hashedPassword = sha256.ComputeHash(passwordBytes);
                model.Password = BitConverter.ToString(hashedPassword).Replace("-", "").ToLower();
            }

            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                PasswordHash = model.Password,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth,
                Address = model.Address,
                UserType = model.UserType,
                IsVerificated = false, 
                IsBlocked = false 
            };

            var commonProjectPath = Path.Combine("..", "Common", "Photos");

            if (model.ProfilePicture != null && model.ProfilePicture.Length > 0)
            {
                // Korisnik je uploadovao sliku
                var filePath = Path.Combine(commonProjectPath, model.ProfilePicture.FileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ProfilePicture.CopyToAsync(stream);
                }

                // Relativna putanja za bazu u odnosu na Common projekat
                user.ProfilePicturePath = Path.Combine("Common", "Photos", model.ProfilePicture.FileName);
            }
            else
            {
                // Korisnik nije uploadovao sliku, dodeli putanju do podrazumevane slike u Common projektu
                user.ProfilePicturePath = Path.Combine("Common", "Photos", "defaultUserPhoto.jpg");
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Registration successful");
        }

        
        [HttpGet("get-user-by-email")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);
        }



        [HttpPut("UpdateUser")]
        public async Task<IActionResult> UpdateUser([FromForm] updateUserDTO updatedUser)
        {
          

            // Pronađi korisnika iz baze koristeći Id
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == updatedUser.Email);
            if (user == null)
            {
                return NotFound();
            }

            // Ažuriraj samo podatke koji su prosleđeni
            if (!string.IsNullOrEmpty(updatedUser.Password))
            {
                // Hashuj novu lozinku pre čuvanja
                using (var sha256 = SHA256.Create())
                {
                    var passwordBytes = Encoding.UTF8.GetBytes(updatedUser.Password);
                    var hashedPassword = sha256.ComputeHash(passwordBytes);
                    user.PasswordHash = BitConverter.ToString(hashedPassword).Replace("-", "").ToLower();
                }
            }
            else
            {
                // Zadrži staru lozinku
                _context.Entry(user).Property(u => u.PasswordHash).IsModified = false;
            }

            // Ažuriraj druge podatke
            user.Username = updatedUser.Username;
            user.Email = updatedUser.Email;
            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.DateOfBirth = updatedUser.DateOfBirth;
            user.Address = updatedUser.Address;

            var commonProjectPath = Path.Combine("..", "Common", "Photos");

            if (updatedUser.ProfilePicture != null && updatedUser.ProfilePicture.Length > 0)
            {
                // Korisnik je uploadovao sliku
                var filePath = Path.Combine(commonProjectPath, updatedUser.ProfilePicture.FileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updatedUser.ProfilePicture.CopyToAsync(stream);
                }

                // Relativna putanja za bazu u odnosu na Common projekat
                user.ProfilePicturePath = Path.Combine("Common", "Photos", updatedUser.ProfilePicture.FileName);
            }
            else
            {
                // Zadrži putanju za staru sliku
                _context.Entry(user).Property(u => u.ProfilePicturePath).IsModified = false;
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(user.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }



    }

}

