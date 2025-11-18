
interface BlogPageArticle {
  date: string;
  title: string;
  description: string;
}

interface BlogPageTranslation {
  hero: {
    title: string;
    subtitle: string;
  };
  article1: BlogPageArticle;
  article2: BlogPageArticle;
  article3: BlogPageArticle;
  article4: BlogPageArticle;
}

interface TranslationBase {
  blogPage?: BlogPageTranslation;
}

export const translations: TranslationBase & any = {

  en: {
    header: {
      nav: {
        home: "Home",
        about: "About",
        services: "Services",
        blog: "Blog",
        bookNow: "Book Now",
        contactUs: "Contact Us",
        eliteOnyx: "Elite Onyx",
      },
      bookAppointment: "Book Appointment",
    },
    hero: {
      slides: [
        {
          title: "Expert Veterinary Care, Tailored to Your Pet's Needs",
          subtitle: "A Pioneering Veterinary Clinic, Providing Exceptional Care Every Step of the Way",
        },
        {
          title: "State-of-the-Art Facilities",
          subtitle: "Modern Equipment and Technology for Accurate Diagnosis and Treatment",
        },
        {
          title: "Happy Pets, Happy Owners",
          subtitle: "Trusted by Pet Owners Across Riyadh Since 2013",
        },
      ],
      cta: "Book an Appointment Now",
    },
    intro: {
      title: "Welcome to Elite Vet",
      subtitle: "Your trusted pet veterinary clinic",
      description: "We are committed to providing top-quality care for your pets. Our veterinary clinic offers a wide range of services, including routine check-ups, vaccinations, surgeries, & dental care, using the latest technology & under the care & expertise of the best veterinarians in KSA.",
      readMore: "Read More",
    },
    services: {
      title: "What we offer?",
      description: "As a leading Riyadh veterinary clinic, we offer a comprehensive range of veterinary services to keep your furry companions happy and healthy.",
      items: [
        {
          title: "Routine Check-ups",
          description: "Comprehensive health examinations for your pets",
        },
        {
          title: "Vaccinations",
          description: "Essential vaccines to protect your pet's health",
        },
        {
          title: "Medical Care",
          description: "Advanced treatment for various health conditions",
        },
        {
          title: "Surgical Services",
          description: "Expert surgical procedures with modern equipment",
        },
      ],
      readMore: "Read more",
    },
    whyChoose: {
      title: "Why choose us?",
      intro: "As a trusted name in the Riyadh veterinary community since 2013, we've helped more than",
      statistics: [
        {
          number: 200000,
          label: "Pet cases examined",
        },
        {
          number: 1000,
          label: "CT Scan cases",
        },
        {
          number: 70000,
          label: "Lab tests and X-ray cases",
        },
      ],
      benefits: [
        {
          title: "24/7 Emergency Care",
          description: "Round-the-clock emergency services for your pets",
        },
        {
          title: "Expert Veterinarians",
          description: "Highly qualified and experienced veterinary professionals",
        },
        {
          title: "Modern Equipment",
          description: "State-of-the-art diagnostic and treatment technology",
        },
        {
          title: "Compassionate Care",
          description: "A dedicated team that loves and cares for animals",
        },
      ],
    },
    team: {
      title: "Our Team",
      description: "Our team of highly skilled veterinarians is committed to providing top-notch care for your furry companions. They're passionate about animal health & dedicated to providing the best possible medical services.",
      members: [
        {
          name: "Dr. Sarah Johnson",
          role: "Chief Veterinarian",
          initials: "SJ",
        },
        {
          name: "Dr. Michael Chen",
          role: "Surgical Specialist",
          initials: "MC",
        },
        {
          name: "Dr. Emily Rodriguez",
          role: "Pet Dentist",
          initials: "ER",
        },
        {
          name: "Dr. Ahmed Al-Mansour",
          role: "Emergency Care",
          initials: "AA",
        },
      ],
    },
    partners: {
      title: "Our Partners",
      items: ["Vest Van", "Elite Falcons"],
    },
    about: {
      hero: {
        title: "Dedicated to Your Pet's Well\u00A0being",
      },
      whoWeAre: {
        title: "Who We Are",
        description: "At Elite Clinic, we're passionate about providing state-of-the-art veterinary care for your beloved pets. Since the establishment of our pet clinic in 2013, we've been dedicated to delivering exceptional medical services and compassionate care, helping more than 200 thousand pets through the years and earning the trust of pet owners across Saudi Arabia and the Gulf region. We're committed to ensuring your pet's well-being and happiness, every step of the way.",
      },
      vision: {
        title: "Our Vision",
        description: "To be the premier pet clinic in Saudi Arabia and the Gulf region.",
      },
      mission: {
        title: "Our Mission",
        description: "To provide exceptional veterinary care, utilizing advanced technology and skilled professionals, to create a healthier future for pets.",
      },
      whyChoose: {
        title: "Why Choose Elite Vet?",
        subtitle: "Your Pet's Well-being, Our Priority",
        description: "Elite Veterinary Clinic provides:",
        points: [
          {
            title: "Personalized Care",
            description: "Tailored treatment plans for each pet.",
          },
          {
            title: "Latest Technology",
            description: "Cutting-edge equipment for accurate diagnosis.",
          },
          {
            title: "Compassionate Staff",
            description: "A dedicated team that loves animals.",
          },
        ],
      },
      csr: {
        title: "Corporate Social Responsibility",
        description: "As a leading pet clinic specializing in veterinary medicine, we recognize our responsibility to the community. We actively contribute to the well-being of animals through various initiatives:",
        initiatives: [
          {
            title: "Awareness Campaigns",
            description: "We use our social media platforms to educate pet owners about responsible pet care, health issues, and preventive measures.",
          },
          {
            title: "Pro Bono Services",
            description: "We provide free veterinary care to animals in need, particularly those belonging to underprivileged families or abandoned animals. To date, we've successfully treated hundreds of cases.",
          },
          {
            title: "Animal Adoption",
            description: "We're committed to finding loving homes for abandoned animals. We provide necessary veterinary care and rehabilitation before placing them up for adoption.",
          },
        ],
        closing: "By prioritizing these initiatives, we strive to make a positive impact on the lives of animals and their owners.",
      },
      ourDoctors: {
        title: "Our Doctors",
        description: "Our pet clinic has a team of highly skilled veterinarians committed to providing top-notch care for your furry companions. Our consultants hold advanced degrees from renowned international universities and bring years of experience to the table. They're passionate about animal health and dedicated to providing the best possible medical services.",
        surgeons: "Our expert surgeons are skilled in handling a wide range of cases, ensuring that your pet receives the highest quality care.",
      },
      careers: {
        title: "Careers",
        subtitle: "Join Our Team",
        description: "As a leading pet clinic, we're always seeking compassionate and skilled individuals to join our dedicated team.",
        applyTitle: "Apply Now",
        applyDescription: "Fill out the form below to submit your application",
        qualificationsTitle: "Qualifications",
        form: {
          personalInfo: "Personal Information",
          fullName: "Full Name",
          fullNamePlaceholder: "Enter your full name",
          email: "Email Address",
          emailPlaceholder: "Enter your email address",
          phone: "Phone Number",
          phonePlaceholder: "Enter your phone number",
          professionalInfo: "Professional Information",
          resume: "Resume/CV Upload",
          coverLetter: "Cover Letter (Optional)",
          coverLetterPlaceholder: "Enter your cover letter",
          position: "Desired Position",
          positionPlaceholder: "e.g., Veterinary Technician",
          startDate: "Available Start Date",
          experience: "Relevant Experience",
          experiencePlaceholder: "e.g., veterinary technician, veterinary assistant, receptionist",
          certifications: "Veterinary Certifications",
          certificationsPlaceholder: "If applicable",
          education: "Education Level and Institution",
          educationPlaceholder: "e.g., Bachelor's in Veterinary Science - University Name",
          interests: "Areas of Interest",
          interestsPlaceholder: "e.g., surgery, internal medicine, emergency care",
          submit: "Submit Application",
          submitting: "Submitting...",
        },
        validation: {
          nameRequired: "Full name is required",
          nameMin: "Name must be at least 2 characters",
          emailRequired: "Email is required",
          emailInvalid: "Please enter a valid email address",
          phoneRequired: "Phone number is required",
          phoneMin: "Please enter a valid phone number",
          resumeRequired: "Resume/CV is required",
          positionRequired: "Desired position is required",
          startDateRequired: "Start date is required",
          experienceRequired: "Relevant experience is required",
          educationRequired: "Education information is required",
        },
        toast: {
          title: "Application Submitted!",
          description: "Thank you for your interest. We'll review your application and get back to you soon.",
        },
      },
    },

    servicesPage: {
      hero: {
        title: "Our Services",
        description: "At Elite Vet, your pet's health is our top priority. As a leading Riyadh veterinary clinic, we offer a comprehensive range of veterinary services to keep your furry companions happy and healthy. From routine check-ups to advanced surgical procedures, our experienced team is dedicated to providing the highest quality care.",
      },
      categories: [
        { id: "medical-specialties", title: "Medical Specialties" },
        { id: "hygiene-care", title: "Hygiene & Appearance Care Services" },
        { id: "diagnostic-tests", title: "Diagnostic Tests" },
        { id: "medical-surgeries", title: "Medical Surgeries" },
        { id: "dental-services", title: "Dental Services" },
        { id: "vaccinations", title: "Periodic Vaccinations" },
        { id: "pet-travel", title: "Pet Travel Procedures" },
        { id: "boarding", title: "Boarding Services" },
        { id: "intensive-care", title: "Intensive Care" },
        { id: "emergency", title: "Emergency Services" },
        { id: "home-care", title: "Home Care Services" },
      ],
      medicalSpecialties: {
        title: "Medical Specialties",
        subtitle: "Elite Vet: Your Premier Riyadh Veterinary Clinic",
        intro: "At Elite Vet, we're dedicated to providing exceptional medical care for your beloved pets. As a leading Riyadh veterinary clinic, we offer a comprehensive range of specialized medical services to address a variety of health concerns. Our team of highly qualified veterinarians and experienced staff is committed to delivering the highest quality care, ensuring your pet's well-being.",
        services: [
          { title: "Internal Medicine", description: "Our internal medicine specialists are experts in diagnosing and treating a wide range of internal diseases affecting pets. From routine check-ups to complex medical conditions, we provide comprehensive care tailored to your pet's specific needs." },
          { title: "Skin, Fungal & Immune System Diseases", description: "Skin conditions can be uncomfortable and distressing for pets. Our veterinarians are skilled in diagnosing and treating various skin, fungal, and immune system diseases. We offer advanced treatments and therapies to help your pet regain their skin health." },
          { title: "Heart Disease", description: "Heart disease can significantly impact your pet's quality of life. Our cardiologists are dedicated to providing state-of-the-art diagnosis and treatment for heart conditions. From routine heartworm prevention to complex cardiac procedures, we're committed to ensuring your pet's heart health." },
          { title: "Isolation & Infectious Diseases", description: "We understand the importance of isolating pets with infectious diseases to prevent the spread of illness. Our isolation ward provides a safe and controlled environment for pets with contagious conditions." },
          { title: "Bird Diseases", description: "Our avian veterinarians are passionate about providing specialized care for birds. We offer a comprehensive range of services for pet bird diseases and care, including routine check-ups, vaccinations, surgical procedures, and nutritional counseling." },
          { title: "Respiratory Diseases", description: "Respiratory diseases can affect your pet's breathing and overall health. Our veterinarians are skilled in diagnosing and treating a variety of respiratory conditions, including bronchitis, pneumonia, and asthma." },
          { title: "Chronic Kidney, Urinary System & Liver Diseases", description: "Chronic kidney, urinary system, and liver diseases can be challenging to manage. Our veterinarians are experienced in diagnosing and treating these conditions, providing comprehensive care to help your pet live a longer, healthier life." },
          { title: "Viral & Bacterial Diseases", description: "Viral and bacterial infections can pose serious threats to your pet's health. Our veterinarians are skilled in diagnosing and treating a wide range of viral and bacterial diseases, including parvovirus, distemper, and feline leukemia." },
          { title: "Eye Diseases", description: "Eye problems can significantly impact your pet's vision and quality of life. Our veterinarians are experienced in diagnosing and treating various eye diseases, including cataracts, glaucoma, and corneal ulcers." },
          { title: "Brain, Spinal Injuries & Disc Herniations", description: "Neurological disorders can be complex and challenging to diagnose. Our veterinarians are skilled in diagnosing and treating a variety of neurological conditions, including brain injuries, spinal cord injuries, and disc herniations." },
        ],
        cta: "Book an appointment",
      },
      hygieneCare: {
        title: "Hygiene & Appearance Care Services",
        intro: "At Elite Vet, we believe that a clean and well-groomed pet is a happy and healthy pet. As a leading Riyadh veterinary clinic, we offer a comprehensive range of hygiene and appearance care services designed to keep your furry friend looking and feeling their best.",
        whyChoose: {
          title: "Why Choose Elite Vet for Your Pet's Grooming Needs?",
          points: [
            { title: "Expert Groomers", description: "Our skilled groomers have years of experience in handling pets of all breeds and sizes." },
            { title: "State-of-the-Art Facilities", description: "Our clinic is equipped with modern grooming facilities and high-quality products." },
            { title: "Gentle and Stress-Free Grooming", description: "We prioritize a calm and stress-free environment for your pet." },
            { title: "Customized Grooming Plans", description: "We offer personalized grooming plans to meet your pet's specific needs." },
          ],
        },
        services: [
          { title: "Teeth Cleaning", description: "Dental health is crucial for your pet's overall well-being. Our professional teeth cleaning services remove plaque and tartar buildup, preventing gum disease and bad breath." },
          { title: "Nail Clipping", description: "Long nails can cause discomfort and injury to your pet. Our experienced groomers will carefully trim your pet's nails to a safe length." },
          { title: "Ear Cleaning", description: "Regular ear cleaning is essential to prevent ear infections and maintain your pet's hearing health. Our team will gently clean your pet's ears, removing wax buildup and debris." },
          { title: "Bathing and Drying", description: "A regular bath can help keep your pet clean and healthy. Our gentle bathing and drying process is tailored to your pet's specific needs, ensuring a relaxing and enjoyable experience." },
          { title: "Hair Combing and Knot Removal", description: "Matted fur can cause discomfort and skin irritation. Our skilled groomers will carefully comb through your pet's coat, removing mats and tangles." },
          { title: "Hair Cutting", description: "A stylish haircut can enhance your pet's appearance and make grooming easier. Our professional groomers offer a variety of haircuts, from simple trims to full breed cuts." },
        ],
        cta: "Contact us!",
      },
      diagnosticTests: {
        title: "Diagnostic Tests",
        intro: "At Elite Vet, we're committed to providing the highest quality veterinary care for your beloved pets. Our state-of-the-art veterinary diagnostic services enable us to accurately diagnose and treat a wide range of health conditions.",
        whyChoose: {
          title: "Why Choose Elite Vet for Your Pet's Diagnostic Needs?",
          points: [
            { title: "Expert Veterinarians", description: "Our highly skilled veterinarians are dedicated to providing accurate and timely diagnoses." },
            { title: "Advanced Technology", description: "We utilize cutting-edge diagnostic equipment to ensure precise results." },
            { title: "Minimal Invasiveness", description: "We strive to minimize discomfort and stress for your pet during veterinary diagnostic procedures." },
            { title: "Comprehensive Care", description: "Our diagnostic services are integrated with our treatment plans to ensure optimal outcomes." },
          ],
        },
        services: [
          { title: "Laboratory Tests", description: "Laboratory tests are essential for diagnosing a variety of health conditions. Our in-house laboratory allows us to quickly and accurately analyze blood, urine, and fecal samples." },
          { title: "X-rays", description: "X-rays are used to diagnose a variety of conditions, including bone fractures, joint diseases, foreign body ingestion, respiratory diseases, and urinary tract diseases." },
          { title: "Ultrasound", description: "Ultrasound imaging uses sound waves to create images of internal organs, such as the heart, liver, kidneys, spleen, and bladder." },
          { title: "Endoscopy", description: "A minimally invasive procedure that allows our experts to examine the internal organs of your pet. It involves inserting a flexible tube with a tiny camera into the body." },
          { title: "CT Scan", description: "CT scans provide detailed cross-sectional images of your pet's body, allowing us to diagnose complex conditions such as brain tumors, spinal cord injuries, internal organ masses, and bone fractures." },
        ],
        cta: "Schedule an appointment",
      },
      medicalSurgeries: {
        title: "Medical Surgeries",
        intro: "At Elite Vet, we're committed to providing the highest quality veterinary care, including advanced veterinary surgery procedures. Our experienced surgeons utilize state-of-the-art techniques and equipment to perform a wide range of surgical procedures.",
        whyChoose: {
          title: "Why Choose Elite Vet for Your Pet Surgery?",
          points: [
            { title: "Expert Surgeons", description: "Our highly skilled surgeons have extensive experience in performing a variety of surgical procedures." },
            { title: "Advanced Technology", description: "We utilize cutting-edge surgical equipment to ensure precise and minimal invasive procedures." },
            { title: "State-of-the-Art Facilities", description: "Our clinic is equipped with modern surgical suites and intensive care units." },
            { title: "Compassionate Care", description: "We prioritize your pet's comfort and well-being throughout the surgical process." },
          ],
        },
        services: [
          { title: "General Surgery", description: "General pet surgery encompasses a wide range of procedures including spaying and neutering, mass removal, and wound repair." },
          { title: "Orthopedic Surgeries", description: "We offer a comprehensive range of orthopedic surgeries to address a variety of musculoskeletal conditions in pets, including fracture repair, joint replacements, and ligament repair." },
          { title: "Neurosurgery", description: "Neurosurgery involves procedures on the nervous system, including the brain and spinal cord, such as IVDD surgery and brain tumor removal." },
          { title: "Soft Tissue Surgery", description: "We offer a comprehensive range of soft tissue surgery services including spay and neuter, mass removal, gastrointestinal surgery, and more." },
          { title: "Gastrointestinal and Reproductive Surgery", description: "We can treat a variety of gastrointestinal conditions and perform reproductive surgeries including spaying, neutering, and treatment of reproductive diseases." },
        ],
        cta: "Schedule a consultation",
      },
      dentalServices: {
        title: "Dental Services",
        intro: "We understand the importance of pet dental care for your furry companion's overall well-being. Our comprehensive pet dental care services are designed to keep your pet's mouth healthy and free from pain.",
        whyChoose: {
          title: "Why Choose Elite Vet for Your Pet's Dental Care?",
          points: [
            { title: "Expert Veterinarians", description: "Our skilled veterinarians are trained to provide comprehensive dental care for pets of all ages and breeds." },
            { title: "Advanced Dental Equipment", description: "We utilize state-of-the-art dental equipment to ensure precise and gentle procedures." },
            { title: "Pain Management", description: "We prioritize your pet's comfort by using effective pain management techniques in our pet dental care." },
            { title: "Comprehensive Dental Care", description: "Our pet dental services address a wide range of oral health issues." },
          ],
        },
        services: [
          { title: "Teeth Cleaning and Tartar Removal", description: "Regular dental cleanings are essential for maintaining your pet's oral health. Our veterinarians will remove plaque and tartar buildup." },
          { title: "Extraction of Damaged Teeth", description: "In some cases, damaged or diseased teeth may need to be extracted. Our experienced veterinarians will perform tooth extractions using advanced techniques." },
          { title: "Gum Treatment", description: "Gum disease is a common dental problem in pets. Our veterinarians can diagnose and treat various forms of gum disease, including gingivitis and periodontitis." },
          { title: "Dental Fillings", description: "Dental fillings are used to repair cavities and protect teeth from further damage." },
          { title: "Treatment of Mouth Infections", description: "Mouth infections, such as abscesses and stomatitis, can cause significant pain and discomfort for your pet. Our veterinarians can diagnose and treat these infections." },
        ],
        cta: "Schedule a dental appointment",
      },
      vaccinations: {
        title: "Periodic Vaccinations",
        intro: "At Elite Vet, we believe in preventive healthcare to keep your pet healthy and happy. Pet vaccinations are a crucial part of preventive care, protecting your pet from a variety of infectious diseases.",
        whyVaccinate: "Pet vaccinations stimulate your pet's immune system, enabling it to fight off specific diseases. By vaccinating your pet, you can protect them from serious illnesses that can cause pain, suffering, and even death.",
        services: [
          { title: "Rabies Vaccine", description: "Rabies is a deadly viral disease that affects the nervous system of mammals. Rabies vaccination is mandatory in many regions and is essential for protecting your pet and public health." },
          { title: "FVRCP Vaccine (for Cats)", description: "This combination vaccine protects cats against feline viral rhinotracheitis, calicivirus, and panleukopenia." },
          { title: "DHPP Vaccine (for Dogs)", description: "This combination vaccine protects dogs against distemper, hepatitis, parvovirus, and parainfluenza." },
          { title: "Bordetella Vaccine", description: "This vaccine protects against kennel cough, a highly contagious respiratory infection." },
        ],
        cta: "Schedule vaccination",
      },
      petTravel: {
        title: "Pet Travel Procedures",
        intro: "Planning to travel with your pet? Elite Vet provides comprehensive pet travel services to ensure a smooth and stress-free journey for both you and your furry companion.",
        services: [
          { title: "Health Certificates", description: "We provide health certificates required for domestic and international travel." },
          { title: "Microchipping", description: "Microchipping is essential for pet identification during travel." },
          { title: "Travel Vaccinations", description: "We ensure your pet has all necessary vaccinations for their destination." },
          { title: "Travel Consultation", description: "Our team provides expert advice on travel requirements and best practices." },
        ],
        cta: "Contact us for travel services",
      },
      boarding: {
        title: "Boarding Services",
        intro: "When you need to travel without your pet, trust Elite Vet's boarding services to provide a safe, comfortable, and caring environment for your furry friend.",
        services: [
          { title: "Comfortable Accommodations", description: "Climate-controlled facilities with spacious, clean kennels." },
          { title: "Daily Exercise", description: "Regular playtime and exercise sessions to keep your pet active and happy." },
          { title: "Medical Supervision", description: "24/7 veterinary supervision to ensure your pet's health and well-being." },
          { title: "Special Care", description: "Medication administration and special dietary requirements accommodated." },
        ],
        cta: "Book boarding",
      },
      intensiveCare: {
        title: "Intensive Care",
        intro: "Our state-of-the-art intensive care unit is equipped to handle critical cases with advanced monitoring and treatment capabilities.",
        services: [
          { title: "24/7 Monitoring", description: "Round-the-clock supervision by experienced veterinary staff." },
          { title: "Advanced Life Support", description: "Oxygen therapy, fluid therapy, and advanced medical equipment." },
          { title: "Pain Management", description: "Comprehensive pain management protocols to ensure your pet's comfort." },
          { title: "Post-Surgical Care", description: "Specialized post-operative monitoring and care." },
        ],
        cta: "Learn more",
      },
      emergency: {
        title: "Emergency Services",
        intro: "Emergencies can happen at any time. Elite Vet provides 24/7 emergency veterinary services to handle urgent medical situations.",
        services: [
          { title: "24/7 Availability", description: "Our emergency team is available around the clock." },
          { title: "Rapid Response", description: "Quick assessment and immediate treatment for critical conditions." },
          { title: "Emergency Surgery", description: "Fully equipped surgical suites for emergency procedures." },
          { title: "Critical Care", description: "Advanced emergency care including trauma treatment and stabilization." },
        ],
        cta: "Emergency: 920011626",
      },
      homeCare: {
        title: "Home Care Services",
        intro: "For pets that need medical attention but are more comfortable at home, we offer comprehensive home care services.",
        services: [
          { title: "Home Visits", description: "Veterinary visits in the comfort of your home." },
          { title: "Medication Administration", description: "Professional medication administration and monitoring." },
          { title: "Post-Operative Care", description: "Follow-up care and wound management at home." },
          { title: "Elderly Pet Care", description: "Specialized care for senior pets with mobility issues." },
        ],
        cta: "Schedule a home visit",
      },
      imageSections: {
        medical: {
          title: "Advanced Medical Care",
          description: "Our state-of-the-art facilities and experienced veterinary team provide comprehensive medical care for all your pet's needs. From routine check-ups to specialized treatments, we're here to ensure your pet's health and happiness.",
        },
        surgery: {
          title: "Expert Surgical Services",
          description: "With cutting-edge surgical equipment and highly trained surgeons, we perform a wide range of procedures with precision and care. Your pet's safety and comfort are our top priorities throughout the entire surgical process.",
        },
        emergency: {
          title: "24/7 Emergency & Care",
          description: "Emergencies don't wait for business hours. Our round-the-clock emergency services ensure your pet receives immediate care when they need it most. Whether at our clinic or in the comfort of your home, we're always ready to help.",
        },
      },
      ui: {
        bookNow: "Book Now",
        readMore: "Read More",
        showLess: "Show Less",
      },
    },
    blogPage: {
      hero: {
        title: "Elite Vet",
        subtitle: "Helpful Tips & Information for Your Pet Care",
      },

      article1: {
        date: "📅 Jan 10, 2025 — Elite Vet Team",
        title: "Caring for Your Pet Birds at Home",
        description:
          "Birds need special care — clean cages, fresh food, and daily interaction. Watch for changes in feathers or appetite, as they can indicate illness. Dr. Paws provides expert avian care and health consultations for all bird species.",
      },

      article2: {
        date: "📅 Jan 18, 2025 — Elite Vet Team",
        title: "Importance of Vaccinations for Pets",
        description:
          "Vaccines protect your pet from dangerous diseases like rabies and parvovirus. Keeping vaccinations up to date ensures long-term safety. Schedule your pet's vaccination today at Dr. Paws and keep them protected year-round.",
      },

      article3: {
        date: "📅 Jan 25, 2025 — Elite Vet Team",
        title: "Why Regular Check-ups Matter for Cats",
        description:
          "Cats often hide signs of illness. Regular veterinary check-ups can detect problems early, keeping your cat healthy and happy. Dr. Paws offers gentle, stress-free examinations to ensure your feline friend's well-being.",
      },

      article4: {
        date: "📅 Feb 01, 2025 — Elite Vet Team",
        title: "Summer Care Tips for Dogs",
        description:
          "Hot Saudi summers can be tough for dogs! Keep your furry friend cool by keeping them hydrated, walking during early mornings, and avoiding hot pavements. Regular grooming helps reduce body heat and keeps them comfortable. Visit Dr. Paws for a summer health check and professional grooming.",
      },
    },

    contact: {
      title: "Contact Us",
      description: "Have a question or concern? Need to schedule an appointment? Contact us today! Our dedicated team is ready to assist you.",
      form: {
        name: "Name",
        namePlaceholder: "Enter your name",
        phone: "Phone Number",
        phonePlaceholder: "Enter your phone number",
        email: "Email",
        emailPlaceholder: "Enter your email",
        message: "Message",
        messagePlaceholder: "Enter your message",
        submit: "Submit",
        sending: "Sending...",
      },
      validation: {
        nameMin: "Name must be at least 2 characters",
        phoneMin: "Please enter a valid phone number",
        emailInvalid: "Please enter a valid email address",
        messageMin: "Message must be at least 10 characters",
      },
      toast: {
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      },

    },
    footer: {
      about: "Elite Veterinary Clinic: Your Trusted Partner in Pet Care. Providing exceptional service & ensuring your pet's well-being.",
      contactInfo: "Contact Info",
      call: "Call: 920011626",
      emergency: "Emergency: 920011626",
      workingHours: "Working Hours",
      hours: "09:00 AM - 10:00 PM",
      daily: "Daily",
      emergencyServices: "24/7 Emergency Services",
      stayInTouch: "Stay In Touch",
      copyright: "Elite Vet. All rights reserved.",
    },
  },
  ar: {
    header: {
      nav: {
        home: "الرئيسيه",
        about: "عن النخبة",
        services: "خدماتنا",
        blog: "المدونة",
        bookNow: "أحجز ألان",
        contactUs: "تواصل معنا",
        eliteOnyx: "أونيكس النخبة",
      },
      bookAppointment: "احجز موعدك",
    },
    hero: {
      slides: [
        {
          title: "رعاية بيطرية متخصصة، مصممة خصيصًا لاحتياجات أليفك",
          subtitle: "وجهتك الأولى للرعاية الصحية الشاملة لصديقك الأليف",
        },
        {
          title: "رعاية بيطرية متخصصة، مصممة خصيصًا لاحتياجات أليفك",
          subtitle: "وجهتك الأولى للرعاية الصحية الشاملة لصديقك الأليف",
        },
        {
          title: "رعاية بيطرية متخصصة، مصممة خصيصًا لاحتياجات أليفك",
          subtitle: "وجهتك الأولى للرعاية الصحية الشاملة لصديقك الأليف",
        },
      ],
      cta: "احجز موعدك الآن",
    },
    intro: {
      title: "مرحبًا بكم في عيادة النخبة البيطرية",
      subtitle: "شريككم الموثوق في رعاية حيواناتكم الأليفة",
      description: "في عيادتنا، نؤمن بأن كل حيوان أليف يستحق الأفضل. لذلك، نحن نقدم أعلى معايير الرعاية البيطرية، باستخدام أحدث التقنيات وأكثرها فاعلية، وذلك لضمان صحة وسعادة صديقك الأليف. النخبة عيادة بيطرية شاملة تقدم مجموعة واسعة من الخدمات، من الفحوصات الروتينية، والتطعيمات، والجراحات، إلى رعاية الأسنان، باستخدام أحدث التقنيات وتحت رعاية وخبرة أفضل الأطباء البيطريين في المملكة العربية السعودية.",
      readMore: "إقرأ المزيد…",
    },
    services: {
      title: "ماذا نقدم؟",
      description: "في عيادة النخبة، أفضل عيادة بيطرية رائدة في الرياض، نقوم بتوفير الرعاية الصحية الشاملة لحيواناتك الأليفة من خلال مجموعة واسعة من الخدمات الطبية لجميع احتياجاتهم الصحية.",
      items: [
        {
          title: "الفحوصات الروتينية",
          description: "فحص صحي شامل لحيواناتك الأليفة",
        },
        {
          title: "التطعيمات",
          description: "اللقاحات الأساسية لحماية صحة حيوانك الأليف",
        },
        {
          title: "الرعاية الطبية",
          description: "علاج متقدم لمختلف الحالات الصحية",
        },
        {
          title: "الخدمات الجراحية",
          description: "إجراءات جراحية متخصصة بأحدث المعدات",
        },
      ],
      readMore: "اقرأ المزيد …",
    },
    whyChoose: {
      title: "لماذا تختار عيادة النخبة البيطرية؟",
      intro: "كأفضل عيادة بيطرية موثوق بها في مجتمع الطب البيطري بالرياض منذ عام 2013، ساعدنا أكثر من",
      statistics: [
        {
          number: 200000,
          label: "حالة حيوان أليف تم فحصها",
        },
        {
          number: 1000,
          label: "حالة أشعة مقطعية",
        },
        {
          number: 70000,
          label: "فحوصات مخبرية وأشعة سينية",
        },
      ],
      benefits: [
        {
          title: "رعاية طوارئ ٢٤/٧",
          description: "خدمات طوارئ على مدار الساعة لحيواناتك الأليفة",
        },
        {
          title: "أطباء بيطريون خبراء",
          description: "طاقم عمل على مستوى عالمي من الخبرة ومحب للحيوانات",
        },
        {
          title: "أحدث التقنيات والمعدات",
          description: "أحدث التقنيات والمعدات لتشخيص فعال",
        },
        {
          title: "رعاية دقيقة",
          description: "رعاية دقيقة من خلال خطط علاجية مصممة خصيصًا لكل حيوان أليف",
        },
      ],
    },
    team: {
      title: "فريق النخبة",
      description: "فريقنا من الأطباء البيطريين المتخصصين يجمع بين الخبرة والرعاية، يقدمون تشخيصًا دقيقًا وعلاجًا فعالًا لجميع الحالات، مع إيلاء اهتمام خاص لراحة ورفاهية صديقك الأليف",
      members: [
        {
          name: "د. سارة جونسون",
          role: "كبير الأطباء البيطريين",
          initials: "SJ",
        },
        {
          name: "د. مايكل تشين",
          role: "أخصائي جراحة",
          initials: "MC",
        },
        {
          name: "د. إميلي رودريغيز",
          role: "طبيب أسنان الحيوانات",
          initials: "ER",
        },
        {
          name: "د. أحمد المنصور",
          role: "رعاية الطوارئ",
          initials: "AA",
        },
      ],
    },
    partners: {
      title: "شركاؤنا",
      items: ["Vest Van", "Elite Falcons"],
    },
    about: {
      hero: {
        title: "خبراء في رعاية الحيوانات الأليفة",
      },
      whoWeAre: {
        title: "من نحن؟",
        description: "في عيادة النخبة البيطرية، نعتبر رعاية حيواناتكم الأليفة شغفاً وليس مجرد عمل. منذ عام 2013، نقدم أعلى معايير الرعاية البيطرية، بدءًا من الفحوصات الروتينية وحتى الجراحات المتقدمة. لقد لمسنا حياة أكثر من 200,000 أليف، ونحن ملتزمون بمواصلة تقديم الحب والعناية التي يستحقونها.",
      },
      vision: {
        title: "رؤيتنا",
        description: "أن نكون عيادة الحيوانات الأليفة الرائدة في المملكة العربية السعودية ومنطقة الخليج.",
      },
      mission: {
        title: "مهمتنا",
        description: "توفير رعاية بيطرية استثنائية، باستخدام أحدث التقنيات وخبرة أمهر الأطباء، لخلق مستقبل أكثر صحة للحيوانات الأليفة.",
      },
      whyChoose: {
        title: "لماذا تختار عيادة النخبة البيطرية؟",
        subtitle: "رعاية حيوانك الأليف الشاملة، أولويتنا",
        description: "تقدم عيادة النخبة البيطرية:",
        points: [
          {
            title: "رعاية دقيقة",
            description: "رعاية دقيقة من خلال خطط علاجية مصممة خصيصًا لكل حيوان أليف.",
          },
          {
            title: "أحدث التقنيات والمعدات",
            description: "أحدث التقنيات والمعدات لتشخيص فعال.",
          },
          {
            title: "طاقم عمل على مستوى عالمي",
            description: "طاقم عمل على مستوى عالمي من الخبرة ومحب للحيوانات.",
          },
        ],
      },
      csr: {
        title: "المسؤولية الاجتماعية",
        description: "لكوننا عيادة الحيوانات الأليفة الرائدة في المملكة، ندرك مسؤوليتنا تجاه المجتمع ونُساهم بنشاط في رعاية الحيوانات من خلال العديد من المبادرات:",
        initiatives: [
          {
            title: "حملات التوعية",
            description: "نستخدم منصات التواصل الاجتماعي الخاصة بنا لتثقيف أصحاب الحيوانات الأليفة حول الرعاية المسؤولة للأليف، والقضايا الصحية، والتدابير الوقائية.",
          },
          {
            title: "الخدمات المجانية",
            description: "نقدم رعاية بيطرية مجانية للحيوانات المحتاجة، خاصة تلك التي تنتمي إلى الأسر محدودة الدخل أو الحيوانات المهجورة. حتى الآن، نجحنا في علاج مئات الحالات.",
          },
          {
            title: "تبني الحيوانات",
            description: "نسعى لإيجاد منازل محبة للحيوانات المهجورة، كما نقدم الرعاية البيطرية والتأهيل اللازمين قبل وضعها للتبني.",
          },
        ],
        closing: "من خلال إعطاء الأولوية لهذه المبادرات، نرى ثمار جهودنا في إحداث تأثير إيجابي على حياة الحيوانات وأصحابها.",
      },
      ourDoctors: {
        title: "فريق العمل",
        description: "يضم فريقنا مجموعة من الأطباء البيطريين ذوي المهارات العالية، ملتزمين بتوفير رعاية من الدرجة الأولى للحيوانات الأليفة. يحمل أخصائيين عيادة النخبة درجات علمية متقدمة من جامعات عالمية مرموقة مع سنوات طويلة من الخبرة في المجال البيطري. مما يجعلهم شغوفون بصحة الحيوانات ومكرسون لتقديم أفضل الخدمات الطبية الممكنة.",
        surgeons: "يمكنك الاطمئنان على صحة حيوانك الأليف بين أيدي فريقنا الجراحي الماهر، الذي يمتلك خبرة طويلة في إجراء مختلف العمليات الجراحية.",
      },
      careers: {
        title: "الوظائف",
        subtitle: "انضم إلى فريقنا",
        description: "انضم إلى النخبة، عيادة الحيوانات الأليفة الرائدة في المملكة، وكن جزءًا من فريق يساهم في تحسين صحة ورفاهية الحيوانات الأليفة في مجتمعنا. نبحث عن أفراد متفانين ومبدعين يساهمون في تحقيق رؤيتنا.",
        applyTitle: "أنضم لفريقنا ألان",
        applyDescription: "",
        qualificationsTitle: "",
        form: {
          personalInfo: "المعلومات الشخصية",
          fullName: "الاسم الكامل",
          fullNamePlaceholder: "أدخل اسمك الكامل",
          email: "البريد الإلكتروني",
          emailPlaceholder: "أدخل بريدك الإلكتروني",
          phone: "رقم الهاتف",
          phonePlaceholder: "أدخل رقم هاتفك",
          professionalInfo: "المعلومات المهنية",
          resume: "السيرة الذاتية",
          coverLetter: "الخطاب التعريفي (اختياري)",
          coverLetterPlaceholder: "أدخل خطابك التعريفي",
          position: "الوظيفة المطلوبة",
          positionPlaceholder: "أدخل الوظيفة المطلوبة",
          startDate: "تاريخ البدء المتاح",
          experience: "الخبرة ذات الصلة",
          experiencePlaceholder: "مثل: فني بيطري، مساعد بيطري، موظف استقبال",
          certifications: "الشهادات البيطرية (إن وجدت)",
          certificationsPlaceholder: "أدخل شهاداتك",
          education: "المستوى التعليمي والمؤسسة",
          educationPlaceholder: "أدخل مستواك التعليمي",
          interests: "مجالات الاهتمام",
          interestsPlaceholder: "مثل: الجراحة، الطب الباطني، الرعاية الطارئة",
          submit: "إرسال الطلب",
          submitting: "جاري الإرسال...",
        },
        validation: {
          nameRequired: "الاسم الكامل مطلوب",
          nameMin: "يجب أن يكون الاسم حرفين على الأقل",
          emailRequired: "البريد الإلكتروني مطلوب",
          emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
          phoneRequired: "رقم الهاتف مطلوب",
          phoneMin: "يرجى إدخال رقم هاتف صحيح",
          resumeRequired: "السيرة الذاتية مطلوبة",
          positionRequired: "الوظيفة المطلوبة مطلوبة",
          startDateRequired: "تاريخ البدء مطلوب",
          experienceRequired: "الخبرة ذات الصلة مطلوبة",
          educationRequired: "المستوى التعليمي مطلوب",
        },
        toast: {
          title: "تم إرسال الطلب!",
          description: "شكرًا لاهتمامك. سنقوم بمراجعة طلبك والتواصل معك قريبًا.",
        },
      },
    },
    contact: {
      title: "تواصلوا معنا",
      description: "هل لديك سؤال أو استفسار؟ هل تحتاج إلى حجز موعد؟ اتصل بنا اليوم! فريقنا على استعداد دائم لمساعدتك.",
      form: {
        name: "الاسم:",
        namePlaceholder: "أدخل اسمك",
        phone: "رقم الهاتف:",
        phonePlaceholder: "أدخل رقم هاتفك",
        email: "البريد الإلكتروني:",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        message: "الرسالة:",
        messagePlaceholder: "أدخل رسالتك",
        submit: "إرسال",
        sending: "جاري الإرسال...",
      },
      validation: {
        nameMin: "يجب أن يكون الاسم حرفين على الأقل",
        phoneMin: "يرجى إدخال رقم هاتف صحيح",
        emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
        messageMin: "يجب أن تكون الرسالة 10 أحرف على الأقل",
      },
      toast: {
        title: "تم إرسال الرسالة!",
        description: "شكرًا لتواصلك معنا. سنتواصل معك قريبًا.",
      },
    },
    servicesPage: {
      hero: {
        title: "خدماتنا",
        description: "في عيادة النخبة البيطرية، صحة حيوانك الأليف هي أولويتنا القصوى. كعيادة بيطرية رائدة في الرياض، نقدم مجموعة شاملة من الخدمات البيطرية للحفاظ على سعادة وصحة أصدقائك الأليفة. من الفحوصات الروتينية إلى الإجراءات الجراحية المتقدمة، فريقنا ذو الخبرة مكرس لتقديم أعلى مستويات الرعاية.",
      },
      categories: [
        { id: "medical-specialties", title: "التخصصات الطبية" },
        { id: "hygiene-care", title: "خدمات النظافة والعناية بالمظهر" },
        { id: "diagnostic-tests", title: "الفحوصات التشخيصية" },
        { id: "medical-surgeries", title: "الجراحات الطبية" },
        { id: "dental-services", title: "خدمات الأسنان" },
        { id: "vaccinations", title: "التطعيمات الدورية" },
        { id: "pet-travel", title: "إجراءات السفر بالحيوانات الأليفة" },
        { id: "boarding", title: "خدمات الإيواء" },
        { id: "intensive-care", title: "العناية المركزة" },
        { id: "emergency", title: "خدمات الطوارئ" },
        { id: "home-care", title: "خدمات الرعاية المنزلية" },
      ],
      medicalSpecialties: {
        title: "التخصصات الطبية",
        subtitle: "عيادة النخبة: عيادتك البيطرية الرائدة في الرياض",
        intro: "في عيادة النخبة البيطرية، نحن ملتزمون بتقديم رعاية طبية استثنائية لحيواناتكم الأليفة المحبوبة. كعيادة بيطرية رائدة في الرياض، نقدم مجموعة شاملة من الخدمات الطبية المتخصصة لمعالجة مجموعة متنوعة من المخاوف الصحية.",
        services: [
          { title: "الطب الباطني", description: "متخصصونا في الطب الباطني خبراء في تشخيص وعلاج مجموعة واسعة من الأمراض الداخلية التي تصيب الحيوانات الأليفة." },
          { title: "أمراض الجلد والفطريات والجهاز المناعي", description: "أطباؤنا البيطريون ماهرون في تشخيص وعلاج أمراض الجلد والفطريات والجهاز المناعي المختلفة." },
          { title: "أمراض القلب", description: "أطباء القلب لدينا ملتزمون بتوفير تشخيص وعلاج متطور لأمراض القلب." },
          { title: "العزل والأمراض المعدية", description: "نحن نفهم أهمية عزل الحيوانات الأليفة المصابة بأمراض معدية لمنع انتشار المرض." },
          { title: "أمراض الطيور", description: "أطباؤنا البيطريون المتخصصون في الطيور متحمسون لتقديم الرعاية المتخصصة للطيور." },
          { title: "أمراض الجهاز التنفسي", description: "يمكن أن تؤثر أمراض الجهاز التنفسي على تنفس حيوانك الأليف وصحته العامة." },
          { title: "أمراض الكلى المزمنة والجهاز البولي والكبد", description: "يمكن أن تكون أمراض الكلى والجهاز البولي والكبد المزمنة صعبة الإدارة." },
          { title: "الأمراض الفيروسية والبكتيرية", description: "يمكن أن تشكل العدوى الفيروسية والبكتيرية تهديدات خطيرة لصحة حيوانك الأليف." },
          { title: "أمراض العيون", description: "يمكن أن تؤثر مشاكل العين بشكل كبير على رؤية حيوانك الأليف ونوعية حياته." },
          { title: "إصابات الدماغ والعمود الفقري والانزلاق الغضروفي", description: "يمكن أن تكون الاضطرابات العصبية معقدة وصعبة التشخيص." },
        ],
        cta: "احجز موعدًا",
      },
      hygieneCare: {
        title: "خدمات النظافة والعناية بالمظهر",
        intro: "في عيادة النخبة البيطرية، نؤمن بأن الحيوان الأليف النظيف والمُعتنى به جيدًا هو حيوان أليف سعيد وصحي.",
        whyChoose: {
          title: "لماذا تختار عيادة النخبة لاحتياجات العناية بحيوانك الأليف؟",
          points: [
            { title: "خبراء في التجميل", description: "لدى خبراء التجميل لدينا سنوات من الخبرة في التعامل مع الحيوانات الأليفة من جميع السلالات والأحجام." },
            { title: "مرافق حديثة", description: "عيادتنا مجهزة بمرافق تجميل حديثة ومنتجات عالية الجودة." },
            { title: "تجميل لطيف وخالٍ من التوتر", description: "نحن نعطي الأولوية لبيئة هادئة وخالية من التوتر لحيوانك الأليف." },
            { title: "خطط تجميل مخصصة", description: "نحن نقدم خطط تجميل مخصصة لتلبية احتياجات حيوانك الأليف المحددة." },
          ],
        },
        services: [
          { title: "تنظيف الأسنان", description: "صحة الأسنان أمر بالغ الأهمية لرفاهية حيوانك الأليف بشكل عام." },
          { title: "قص الأظافر", description: "يمكن أن تسبب الأظافر الطويلة عدم الراحة والإصابة لحيوانك الأليف." },
          { title: "تنظيف الأذن", description: "التنظيف المنتظم للأذن ضروري لمنع التهابات الأذن والحفاظ على صحة سمع حيوانك الأليف." },
          { title: "الاستحمام والتجفيف", description: "يمكن أن يساعد الحمام المنتظم في الحفاظ على نظافة وصحة حيوانك الأليف." },
          { title: "تمشيط الشعر وإزالة العقد", description: "يمكن أن يسبب الفراء المتشابك عدم الراحة وتهيج الجلد." },
          { title: "قص الشعر", description: "يمكن أن تعزز قصة الشعر الأنيقة مظهر حيوانك الأليف وتسهل العناية به." },
        ],
        cta: "اتصل بنا!",
      },
      diagnosticTests: {
        title: "الفحوصات التشخيصية",
        intro: "في عيادة النخبة البيطرية، نحن ملتزمون بتقديم أعلى مستويات الرعاية البيطرية لحيواناتكم الأليفة المحبوبة.",
        whyChoose: {
          title: "لماذا تختار عيادة النخبة لاحتياجات التشخيص الخاصة بحيوانك الأليف؟",
          points: [
            { title: "أطباء بيطريون خبراء", description: "أطباؤنا البيطريون ذوو المهارات العالية ملتزمون بتقديم تشخيصات دقيقة وفي الوقت المناسب." },
            { title: "تكنولوجيا متقدمة", description: "نحن نستخدم معدات تشخيصية متطورة لضمان نتائج دقيقة." },
            { title: "الحد الأدنى من التدخل", description: "نحن نسعى جاهدين لتقليل الانزعاج والتوتر لحيوانك الأليف أثناء الإجراءات التشخيصية البيطرية." },
            { title: "رعاية شاملة", description: "خدماتنا التشخيصية متكاملة مع خطط العلاج الخاصة بنا لضمان النتائج المثلى." },
          ],
        },
        services: [
          { title: "الفحوصات المخبرية", description: "الفحوصات المخبرية ضرورية لتشخيص مجموعة متنوعة من الحالات الصحية." },
          { title: "الأشعة السينية", description: "تستخدم الأشعة السينية لتشخيص مجموعة متنوعة من الحالات." },
          { title: "الموجات فوق الصوتية", description: "تستخدم الموجات فوق الصوتية موجات صوتية لإنشاء صور للأعضاء الداخلية." },
          { title: "التنظير", description: "إجراء طفيف التوغل يسمح لخبرائنا بفحص الأعضاء الداخلية لحيوانك الأليف." },
          { title: "الأشعة المقطعية", description: "توفر الأشعة المقطعية صورًا مقطعية مفصلة لجسم حيوانك الأليف." },
        ],
        cta: "حدد موعدًا",
      },
      medicalSurgeries: {
        title: "الجراحات الطبية",
        intro: "في عيادة النخبة البيطرية، نحن ملتزمون بتقديم أعلى مستويات الرعاية البيطرية، بما في ذلك إجراءات الجراحة البيطرية المتقدمة.",
        whyChoose: {
          title: "لماذا تختار عيادة النخبة لجراحة حيوانك الأليف؟",
          points: [
            { title: "جراحون خبراء", description: "جراحونا ذوو المهارات العالية لديهم خبرة واسعة في إجراء مجموعة متنوعة من الإجراءات الجراحية." },
            { title: "تكنولوجيا متقدمة", description: "نحن نستخدم معدات جراحية متطورة لضمان إجراءات دقيقة وطفيفة التوغل." },
            { title: "مرافق حديثة", description: "عيادتنا مجهزة بأجنحة جراحية حديثة ووحدات عناية مركزة." },
            { title: "رعاية رحيمة", description: "نحن نعطي الأولوية لراحة ورفاهية حيوانك الأليف طوال العملية الجراحية." },
          ],
        },
        services: [
          { title: "الجراحة العامة", description: "تشمل الجراحة العامة مجموعة واسعة من الإجراءات بما في ذلك التعقيم والخصي وإزالة الكتل وإصلاح الجروح." },
          { title: "جراحات العظام", description: "نحن نقدم مجموعة شاملة من جراحات العظام لمعالجة مجموعة متنوعة من حالات العضلات والعظام في الحيوانات الأليفة." },
          { title: "جراحة الأعصاب", description: "تشمل جراحة الأعصاب إجراءات على الجهاز العصبي، بما في ذلك الدماغ والحبل الشوكي." },
          { title: "جراحة الأنسجة الرخوة", description: "نحن نقدم مجموعة شاملة من خدمات جراحة الأنسجة الرخوة." },
          { title: "جراحة الجهاز الهضمي والتناسلي", description: "يمكننا علاج مجموعة متنوعة من حالات الجهاز الهضمي وإجراء جراحات الإنجاب." },
        ],
        cta: "حدد استشارة",
      },
      dentalServices: {
        title: "خدمات الأسنان",
        intro: "نحن نفهم أهمية رعاية أسنان الحيوانات الأليفة لرفاهية رفيقك الفروي بشكل عام.",
        whyChoose: {
          title: "لماذا تختار عيادة النخبة لرعاية أسنان حيوانك الأليف؟",
          points: [
            { title: "أطباء بيطريون خبراء", description: "أطباؤنا البيطريون المهرة مدربون على تقديم رعاية أسنان شاملة للحيوانات الأليفة من جميع الأعمار والسلالات." },
            { title: "معدات أسنان متقدمة", description: "نحن نستخدم معدات أسنان حديثة لضمان إجراءات دقيقة ولطيفة." },
            { title: "إدارة الألم", description: "نحن نعطي الأولوية لراحة حيوانك الأليف باستخدام تقنيات فعالة لإدارة الألم في رعاية أسنان الحيوانات الأليفة." },
            { title: "رعاية أسنان شاملة", description: "تتعامل خدمات أسنان الحيوانات الأليفة لدينا مع مجموعة واسعة من مشاكل صحة الفم." },
          ],
        },
        services: [
          { title: "تنظيف الأسنان وإزالة الجير", description: "عمليات التنظيف المنتظمة للأسنان ضرورية للحفاظ على صحة فم حيوانك الأليف." },
          { title: "خلع الأسنان التالفة", description: "في بعض الحالات، قد تحتاج الأسنان التالفة أو المريضة إلى الخلع." },
          { title: "علاج اللثة", description: "أمراض اللثة مشكلة أسنان شائعة في الحيوانات الأليفة." },
          { title: "حشوات الأسنان", description: "تستخدم حشوات الأسنان لإصلاح التجاويف وحماية الأسنان من المزيد من الضرر." },
          { title: "علاج التهابات الفم", description: "يمكن أن تسبب التهابات الفم، مثل الخراجات والتهاب الفم، ألمًا وعدم راحة كبيرة لحيوانك الأليف." },
        ],
        cta: "حدد موعد أسنان",
      },
      vaccinations: {
        title: "التطعيمات الدورية",
        intro: "في عيادة النخبة البيطرية، نؤمن بالرعاية الصحية الوقائية للحفاظ على صحة وسعادة حيوانك الأليف.",
        whyVaccinate: "تحفز تطعيمات الحيوانات الأليفة جهاز المناعة لديها، مما يمكنها من مكافحة أمراض معينة.",
        services: [
          { title: "لقاح داء الكلب", description: "داء الكلب مرض فيروسي مميت يؤثر على الجهاز العصبي للثدييات." },
          { title: "لقاح FVRCP (للقطط)", description: "يحمي هذا اللقاح المركب القطط من التهاب الأنف الفيروسي والفيروس الكأسي والفيروس الصغير." },
          { title: "لقاح DHPP (للكلاب)", description: "يحمي هذا اللقاح المركب الكلاب من الطاعون والتهاب الكبد والفيروس الصغير والإنفلونزا." },
          { title: "لقاح البورديتيلا", description: "يحمي هذا اللقاح من سعال الكلاب، وهو عدوى تنفسية شديدة العدوى." },
        ],
        cta: "حدد موعد التطعيم",
      },
      petTravel: {
        title: "إجراءات السفر بالحيوانات الأليفة",
        intro: "هل تخطط للسفر مع حيوانك الأليف؟ توفر عيادة النخبة البيطرية خدمات سفر شاملة للحيوانات الأليفة.",
        services: [
          { title: "شهادات صحية", description: "نحن نقدم شهادات صحية مطلوبة للسفر المحلي والدولي." },
          { title: "زرع الرقاقة الإلكترونية", description: "زرع الرقاقة الإلكترونية ضروري لتحديد هوية الحيوانات الأليفة أثناء السفر." },
          { title: "تطعيمات السفر", description: "نحن نضمن أن يحصل حيوانك الأليف على جميع التطعيمات اللازمة لوجهته." },
          { title: "استشارة السفر", description: "يقدم فريقنا مشورة الخبراء بشأن متطلبات السفر وأفضل الممارسات." },
        ],
        cta: "اتصل بنا لخدمات السفر",
      },
      boarding: {
        title: "خدمات الإيواء",
        intro: "عندما تحتاج إلى السفر بدون حيوانك الأليف، ثق في خدمات الإيواء في عيادة النخبة البيطرية.",
        services: [
          { title: "إقامة مريحة", description: "مرافق ذات تحكم في المناخ مع أقفاص واسعة ونظيفة." },
          { title: "تمرين يومي", description: "جلسات لعب وتمرين منتظمة للحفاظ على نشاط وسعادة حيوانك الأليف." },
          { title: "إشراف طبي", description: "إشراف بيطري على مدار الساعة طوال أيام الأسبوع لضمان صحة ورفاهية حيوانك الأليف." },
          { title: "رعاية خاصة", description: "إعطاء الأدوية واستيعاب المتطلبات الغذائية الخاصة." },
        ],
        cta: "احجز الإيواء",
      },
      intensiveCare: {
        title: "العناية المركزة",
        intro: "وحدة العناية المركزة الحديثة لدينا مجهزة للتعامل مع الحالات الحرجة مع قدرات مراقبة وعلاج متقدمة.",
        services: [
          { title: "مراقبة على مدار الساعة", description: "إشراف على مدار الساعة من قبل طاقم بيطري ذي خبرة." },
          { title: "دعم الحياة المتقدم", description: "العلاج بالأكسجين والسوائل والمعدات الطبية المتقدمة." },
          { title: "إدارة الألم", description: "بروتوكولات شاملة لإدارة الألم لضمان راحة حيوانك الأليف." },
          { title: "الرعاية بعد الجراحة", description: "مراقبة ورعاية متخصصة بعد العملية." },
        ],
        cta: "تعرف على المزيد",
      },
      emergency: {
        title: "خدمات الطوارئ",
        intro: "يمكن أن تحدث حالات الطوارئ في أي وقت. توفر عيادة النخبة البيطرية خدمات بيطرية طارئة على مدار الساعة.",
        services: [
          { title: "متاح على مدار الساعة", description: "فريق الطوارئ لدينا متاح على مدار الساعة." },
          { title: "استجابة سريعة", description: "تقييم سريع وعلاج فوري للحالات الحرجة." },
          { title: "جراحة طوارئ", description: "أجنحة جراحية مجهزة بالكامل للإجراءات الطارئة." },
          { title: "رعاية حرجة", description: "رعاية طوارئ متقدمة بما في ذلك علاج الصدمات والاستقرار." },
        ],
        cta: "الطوارئ: 920011626",
      },
      homeCare: {
        title: "خدمات الرعاية المنزلية",
        intro: "للحيوانات الأليفة التي تحتاج إلى رعاية طبية ولكنها أكثر راحة في المنزل، نقدم خدمات رعاية منزلية شاملة.",
        services: [
          { title: "زيارات منزلية", description: "زيارات بيطرية في راحة منزلك." },
          { title: "إعطاء الأدوية", description: "إعطاء الأدوية والمراقبة المهنية." },
          { title: "الرعاية بعد الجراحة", description: "رعاية متابعة وإدارة الجروح في المنزل." },
          { title: "رعاية الحيوانات الأليفة المسنة", description: "رعاية متخصصة للحيوانات الأليفة الكبيرة التي تعاني من مشاكل في الحركة." },
        ],
        cta: "حدد زيارة منزلية",
      },
      imageSections: {
        medical: {
          title: "رعاية طبية متقدمة",
          description: "تقدم مرافقنا الحديثة وفريقنا البيطري ذو الخبرة رعاية طبية شاملة لجميع احتياجات حيوانك الأليف. من الفحوصات الروتينية إلى العلاجات المتخصصة، نحن هنا لضمان صحة وسعادة حيوانك الأليف.",
        },
        surgery: {
          title: "خدمات جراحية خبيرة",
          description: "مع معدات جراحية متطورة وجراحين مدربين تدريباً عالياً، نجري مجموعة واسعة من الإجراءات بدقة وعناية. سلامة وراحة حيوانك الأليف هي أولويتنا القصوى طوال عملية الجراحة بأكملها.",
        },
        emergency: {
          title: "رعاية طوارئ على مدار الساعة",
          description: "لا تنتظر حالات الطوارئ ساعات العمل. تضمن خدمات الطوارئ على مدار الساعة لدينا حصول حيوانك الأليف على الرعاية الفورية عندما يحتاجها أكثر. سواء في عيادتنا أو في راحة منزلك، نحن دائماً مستعدون للمساعدة.",
        },
      },
      ui: {
        bookNow: "احجز الآن",
        readMore: "اقرأ المزيد",
        showLess: "عرض أقل",
      },
    },
    footer: {
      about: "عيادة النخبة البيطرية: شريكك الموثوق في رعاية صديقك الأليف. استمتع برعاية بيطرية متميزة لأليفك. النخبة عيادة بيطرية رائدة تقدم حلولًا شاملة لجميع احتياجاتهم الصحية، بدءًا من الفحوصات الوقائية وحتى العلاجات المتخصصة.",
      contactInfo: "تواصل معنا",
      call: "اتصل على: 920011626",
      emergency: "للطوارئ: 920011626",
      workingHours: "مواعيد العمل",
      hours: "من الـ ٩ صباحًا إلى الـ١٠ مساًء",
      daily: "يوميًا",
      emergencyServices: "خدمات طوارئ ٢٤ ساعة",
      stayInTouch: "تابعنا",
      copyright: "النخبة البيطرية. جميع الحقوق محفوظة.",
    },
  },
};

export type Language = 'en' | 'ar';
