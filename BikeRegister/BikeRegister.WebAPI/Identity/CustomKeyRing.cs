using Microsoft.AspNetCore.Identity;

namespace BikeRegister.WebAPI.Identity
{
    public class CustomKeyRing(IConfiguration configuration) : ILookupProtectorKeyRing
    {
        public string this[string keyId] => keyId;
        public string CurrentKeyId => "key-2026";
        public IEnumerable<string> GetAllKeyIds() => new[] { "key-2026" };
    }
}
