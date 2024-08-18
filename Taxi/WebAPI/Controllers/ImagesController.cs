using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {


        [HttpGet("{*filePath}")]
        public IActionResult GetImage(string filePath)
        {
            filePath = Path.Combine("..", filePath);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var parts = filePath.Split('/');
            var fileName = parts[2];

            var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
            var contentType = fileExtension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream",
            };

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, contentType); 
        }
    }
}
