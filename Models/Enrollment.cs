namespace ALARKKAN.LMS.Models
{
    public class Enrollment
    {
        public int Id { get; set; }
        public string TraineeId { get; set; }
        public int ClassId { get; set; }
        public DateTime EnrollmentDate { get; set; }

        public ApplicationUser Trainee { get; set; }

        public Class Class { get; set; }
    }
}
