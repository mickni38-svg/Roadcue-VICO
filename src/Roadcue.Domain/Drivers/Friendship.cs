namespace Roadcue.Domain.Drivers;

public class Friendship
{
    public Guid Id { get; set; }

    public Guid DriverId { get; set; }

    public Guid FriendDriverId { get; set; }
}