namespace ALARKKAN.LMS.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public string TraineeId { get; set; }
        public int CourseId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }

        public ApplicationUser Trainee { get; set; }
        public Course Course { get; set; }
    }
}
