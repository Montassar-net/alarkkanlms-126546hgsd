namespace ALARKKAN.LMS.Models
{
    public class Class
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public DateTime Time { get; set; }
        public string Location { get; set; }
        public bool IsOpen { get; set; }

        public Course Course { get; set; }

        public string TrainerId { get; set; }
        public ApplicationUser Trainer { get; set; }

    }
}
