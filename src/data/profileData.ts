import { Profile } from '@/types/profile';

export type RashiValue = 
  | "Mesha" | "Vrishabha" | "Mithuna" | "Karka" 
  | "Simha" | "Kanya" | "Tula" | "Vrishchika" 
  | "Dhanu" | "Makara" | "Kumbha" | "Meena"
  | "Other";

export const profiles: Profile[] = [
  {
    id: "profile1",
    userId: "user1",
    name: "Aditya Sharma",
    age: 28,
    gender: "male",
    maritalStatus: "Never Married",
    height: 175,
    location: {
      country: "India",
      state: "Karnataka",
      city: "Bangalore"
    },
    about: "I am a software engineer who values tradition and spiritual growth. I enjoy reading Vedic literature, practicing yoga, and contributing to community service. Looking for someone who shares similar values and aspirations for building a harmonious life together.",
    images: ["https://randomuser.me/api/portraits/men/32.jpg", "https://randomuser.me/api/portraits/men/33.jpg", "https://randomuser.me/api/portraits/men/34.jpg"],
    education: [
      {
        degree: "B.Tech Computer Science",
        institution: "BITS Pilani",
        year: 2018
      },
      {
        degree: "M.Tech AI & Machine Learning",
        institution: "IISc Bangalore",
        year: 2020
      }
    ],
    employment: {
      profession: "Software Engineer",
      company: "Microsoft",
      position: "Senior Developer",
      income: "25-30 LPA"
    },
    family: {
      fatherName: "Rajesh Sharma",
      fatherOccupation: "Retired Professor",
      motherName: "Sudha Sharma",
      motherOccupation: "Homemaker",
      siblings: 1,
      familyType: "nuclear",
      gotra: "Vatsa",
      subcaste: "Gaur",
      ishtaDevata: "Ganesha"
    },
    horoscope: {
      rashi: "Kumbha",
      nakshatra: "Shatabhisha",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1996-03-15T14:30:00",
      birthPlace: "Delhi, India",
      ascendant: "Mesha",
      navamsa: "Simha",
      kundaliFile: "/horoscope/aditya_kundali.pdf",
      kundaliPermission: "matches",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 28
    },
    preferences: {
      ageRange: [25, 30],
      heightRange: [155, 170],
      education: ["Bachelor's", "Master's"],
      profession: ["Software Engineer", "Teacher", "Doctor"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India"],
        states: ["Karnataka", "Maharashtra", "Delhi"],
        cities: ["Bangalore", "Mumbai", "Delhi"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Bharadwaja", "Kaashyapa", "Vasishtha"],
      subcaste: ["Gaur", "Deshastha", "Namboodiri"],
      rashi: ["Kanya", "Tula", "Meena"],
      ishtaDevata: ["Lakshmi", "Vishnu", "Shiva"],
      horoscopeWeightage: {
        rashiCompatibility: 25,
        nakshatraCompatibility: 25,
        gunaMatch: 30,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-05-15"),
    isVerified: true
  },
  {
    id: "profile2",
    userId: "user2",
    name: "Priya Iyer",
    age: 26,
    gender: "female",
    maritalStatus: "Never Married",
    height: 162,
    location: {
      country: "India",
      state: "Maharashtra",
      city: "Mumbai"
    },
    about: "I am a classical dancer and chartered accountant, balancing art and profession in life. I come from a traditional family that values our cultural heritage. I enjoy teaching Bharatanatyam on weekends, reading philosophy, and cooking traditional South Indian cuisine.",
    images: ["https://randomuser.me/api/portraits/women/44.jpg", "https://randomuser.me/api/portraits/women/45.jpg", "https://randomuser.me/api/portraits/women/46.jpg"],
    education: [
      {
        degree: "B.Com",
        institution: "University of Mumbai",
        year: 2019
      },
      {
        degree: "Chartered Accountancy",
        institution: "ICAI",
        year: 2021
      }
    ],
    employment: {
      profession: "Chartered Accountant",
      company: "Ernst & Young",
      position: "Associate",
      income: "18-22 LPA"
    },
    family: {
      fatherName: "Krishnan Iyer",
      fatherOccupation: "Bank Manager",
      motherName: "Lakshmi Iyer",
      motherOccupation: "School Teacher",
      siblings: 1,
      familyType: "nuclear",
      gotra: "Kaashyapa",
      subcaste: "Iyer",
      ishtaDevata: "Vishnu"
    },
    horoscope: {
      rashi: "Kanya",
      nakshatra: "Hasta",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1998-09-22T08:15:00",
      birthPlace: "Mumbai, India",
      ascendant: "Tula",
      navamsa: "Kumbha",
      kundaliFile: "/horoscope/priya_kundali.pdf",
      kundaliPermission: "private",
      doshas: {
        mangal: false,
        nadi: true,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 32
    },
    preferences: {
      ageRange: [26, 32],
      heightRange: [170, 185],
      education: ["Bachelor's", "Master's", "Professional Degree"],
      profession: ["Engineer", "Doctor", "Businessman", "CA", "Lawyer"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India"],
        states: ["Maharashtra", "Karnataka", "Tamil Nadu"],
        cities: ["Mumbai", "Pune", "Bangalore", "Chennai"]
      },
      manglik: null,
      excludeMyGotra: false,
      acceptedGotras: ["Bharadwaja", "Vatsa", "Vasishtha", "Atri"],
      subcaste: ["Iyer", "Iyengar", "Deshastha"],
      rashi: ["Mesha", "Simha", "Dhanu", "Kumbha"],
      ishtaDevata: ["Vishnu", "Krishna", "Rama"],
      horoscopeWeightage: {
        rashiCompatibility: 20,
        nakshatraCompatibility: 20,
        gunaMatch: 40,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-06-22"),
    isVerified: true
  },
  {
    id: "profile3",
    userId: "user3",
    name: "Arjun Desai",
    age: 31,
    gender: "male",
    maritalStatus: "Never Married",
    height: 182,
    location: {
      country: "India",
      state: "Tamil Nadu",
      city: "Chennai"
    },
    about: "Doctor by profession, spiritual seeker by heart. I believe in balancing modern medicine with traditional wellness practices. Looking for a life partner who values both professional growth and cultural traditions. I enjoy traveling to spiritual places and practicing meditation.",
    images: ["https://randomuser.me/api/portraits/men/45.jpg", "https://randomuser.me/api/portraits/men/46.jpg", "https://randomuser.me/api/portraits/men/47.jpg"],
    education: [
      {
        degree: "MBBS",
        institution: "AIIMS Delhi",
        year: 2016
      },
      {
        degree: "MD Internal Medicine",
        institution: "AIIMS Delhi",
        year: 2020
      }
    ],
    employment: {
      profession: "Doctor",
      company: "Apollo Hospitals",
      position: "Senior Resident",
      income: "40-45 LPA"
    },
    family: {
      fatherName: "Vikram Desai",
      fatherOccupation: "Business Owner",
      motherName: "Jyoti Desai",
      motherOccupation: "Homemaker",
      siblings: 1,
      familyType: "joint",
      gotra: "Bharadwaja",
      subcaste: "Deshastha",
      ishtaDevata: "Shiva"
    },
    horoscope: {
      rashi: "Mesha",
      nakshatra: "Ashwini",
      manglik: true,
      matchingRequired: true,
      birthDateTime: "1993-04-12T06:45:00",
      birthPlace: "Pune, India",
      ascendant: "Dhanu",
      navamsa: "Vrishabha",
      kundaliFile: "/horoscope/arjun_kundali.pdf",
      kundaliPermission: "matches",
      doshas: {
        mangal: true,
        nadi: false,
        bhakoot: false,
        gana: true
      },
      gunaPoints: 26
    },
    preferences: {
      ageRange: [25, 30],
      heightRange: [160, 175],
      education: ["Bachelor's", "Master's", "Professional Degree"],
      profession: ["Doctor", "Professor", "Civil Services", "Engineer"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India"],
        states: ["Tamil Nadu", "Karnataka", "Maharashtra"],
        cities: ["Chennai", "Bangalore", "Mumbai"]
      },
      manglik: true,
      excludeMyGotra: true,
      acceptedGotras: ["Kaashyapa", "Atri", "Vasishtha"],
      subcaste: ["Deshastha", "Chitpavan", "Iyer", "Iyengar"],
      rashi: ["Tula", "Kumbha", "Mithuna"],
      ishtaDevata: ["Shiva", "Vishnu", "Ganesha"],
      horoscopeWeightage: {
        rashiCompatibility: 30,
        nakshatraCompatibility: 20,
        gunaMatch: 30,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-08-10"),
    isVerified: true
  },
  {
    id: "profile4",
    userId: "user4",
    name: "Kavya Nambiar",
    age: 27,
    gender: "female",
    maritalStatus: "Never Married",
    height: 165,
    location: {
      country: "India",
      state: "Kerala",
      city: "Kochi"
    },
    about: "I'm a software architect with a deep interest in classical arts and literature. I practice Carnatic music and am fluent in Malayalam, Tamil, English, and Sanskrit. Seeking a partner who appreciates both technology and tradition. I love cooking traditional Kerala dishes and reading ancient texts.",
    images: ["https://randomuser.me/api/portraits/women/28.jpg", "https://randomuser.me/api/portraits/women/29.jpg", "https://randomuser.me/api/portraits/women/30.jpg"],
    education: [
      {
        degree: "B.Tech Computer Science",
        institution: "IIT Madras",
        year: 2017
      },
      {
        degree: "M.Tech AI & Machine Learning",
        institution: "IIT Madras",
        year: 2019
      }
    ],
    employment: {
      profession: "Software Architect",
      company: "Google",
      position: "Technical Lead",
      income: "35-40 LPA"
    },
    family: {
      fatherName: "Manoj Nambiar",
      fatherOccupation: "Government Officer",
      motherName: "Lakshmi Nambiar",
      motherOccupation: "College Professor",
      siblings: 1,
      familyType: "nuclear",
      gotra: "Kaashyapa",
      subcaste: "Namboodiri",
      ishtaDevata: "Durga"
    },
    horoscope: {
      rashi: "Meena",
      nakshatra: "Uttara Bhadrapada",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1997-02-28T23:30:00",
      birthPlace: "Kochi, India",
      ascendant: "Kumbha",
      navamsa: "Kanya",
      kundaliFile: "/horoscope/kavya_kundali.pdf",
      kundaliPermission: "public",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: true,
        gana: false
      },
      gunaPoints: 31
    },
    preferences: {
      ageRange: [27, 34],
      heightRange: [170, 190],
      education: ["Master's", "PhD", "Professional Degree"],
      profession: ["Engineer", "Scientist", "Professor", "Entrepreneur"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India", "USA", "UK", "Singapore"],
        states: ["Kerala", "Karnataka", "Tamil Nadu", "Maharashtra"],
        cities: ["Kochi", "Bangalore", "Chennai", "Mumbai"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Bharadwaja", "Atri", "Vatsa", "Vishvamitra"],
      subcaste: ["Namboodiri", "Iyer", "Iyengar", "Deshastha"],
      rashi: ["Karka", "Vrishabha", "Simha", "Dhanu"],
      ishtaDevata: ["Durga", "Vishnu", "Shiva"],
      horoscopeWeightage: {
        rashiCompatibility: 20,
        nakshatraCompatibility: 30,
        gunaMatch: 25,
        doshaCheck: 25
      }
    },
    createdAt: new Date("2023-09-05"),
    isVerified: true
  },
    {
      id: "profile5",
      userId: "user5",
      name: "Vikram Chaturvedi",
      age: 32,
      gender: "male",
      maritalStatus: "Divorced",
      height: 178,
      location: {
        country: "India",
        state: "Delhi",
        city: "New Delhi"
      },
      about: "Entrepreneur with a chain of wellness centers across Northern India. After my divorce 3 years ago, I've focused on personal growth and my business. I enjoy traveling, reading about history, and practice meditation daily. Looking for a mature partner who understands life's complexities.",
      images: ["https://randomuser.me/api/portraits/men/50.jpg", "https://randomuser.me/api/portraits/men/51.jpg", "https://randomuser.me/api/portraits/men/52.jpg"],
      education: [
        {
          degree: "MBA",
          institution: "IIM Ahmedabad",
          year: 2015
        },
        {
          degree: "B.Com",
          institution: "Delhi University",
          year: 2013
        }
      ],
      employment: {
        profession: "Entrepreneur",
        company: "Aum Wellness (Self-owned)",
        position: "Founder & CEO",
        income: "50+ LPA"
      },
      family: {
        fatherName: "Mohan Chaturvedi",
        fatherOccupation: "Retired Businessman",
        motherName: "Sita Chaturvedi",
        motherOccupation: "Homemaker",
        siblings: 2,
        familyType: "joint",
        gotra: "Gritsamada",
        subcaste: "Anavil",
        ishtaDevata: "Krishna"
      },
    horoscope: {
      rashi: "Simha",
      nakshatra: "Magha",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1992-08-02T13:20:00",
      birthPlace: "New Delhi, India",
      ascendant: "Karka",
      navamsa: "Mesha",
      kundaliFile: "/horoscope/vikram_kundali.pdf",
      kundaliPermission: "public",
      doshas: {
        mangal: false,
        nadi: true,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 29
    },
    preferences: {
      ageRange: [26, 32],
      heightRange: [160, 175],
      education: ["Bachelor's", "Master's"],
      profession: ["Teacher", "Doctor", "Entrepreneur"],
      maritalStatus: ["Never Married", "Divorced", "Widowed"],
      locationPreferences: {
        countries: ["India"],
        states: ["Delhi", "Haryana", "Uttar Pradesh", "Rajasthan"],
        cities: ["New Delhi", "Gurgaon", "Noida", "Jaipur"]
      },
      manglik: null,
      excludeMyGotra: false,
      acceptedGotras: ["Bharadwaja", "Kaashyapa", "Other"],
      subcaste: ["Anavil", "Deshastha", "Other"],
      rashi: ["Simha", "Mesha", "Other"],
      ishtaDevata: ["Krishna", "Vishnu", "Other"],
      horoscopeWeightage: {
        rashiCompatibility: 15,
        nakshatraCompatibility: 15,
        gunaMatch: 40,
        doshaCheck: 30
      }
    },
    createdAt: new Date("2023-07-18"),
    isVerified: true
  },
  // Adding 5 more diverse profiles
  {
    id: "profile6",
    userId: "user6",
    name: "Radhika Joshi",
    age: 29,
    gender: "female",
    maritalStatus: "Never Married",
    height: 158,
    location: {
      country: "India",
      state: "Gujarat",
      city: "Ahmedabad"
    },
    about: "I'm a yoga instructor and ayurveda practitioner who believes in holistic wellness. I've studied in Rishikesh and practice traditional healing methods. I love nature, organic farming, and creating a peaceful environment. Seeking someone who values natural living and spiritual growth.",
    images: ["https://randomuser.me/api/portraits/women/35.jpg", "https://randomuser.me/api/portraits/women/36.jpg", "https://randomuser.me/api/portraits/women/37.jpg"],
    education: [
      {
        degree: "B.Sc Psychology",
        institution: "Gujarat University",
        year: 2016
      },
      {
        degree: "Diploma in Yoga & Ayurveda",
        institution: "Patanjali Yogpeeth",
        year: 2018
      }
    ],
    employment: {
      profession: "Yoga Instructor",
      company: "Wellness Center (Self-employed)",
      position: "Senior Instructor",
      income: "12-15 LPA"
    },
    family: {
      fatherName: "Ramesh Joshi",
      fatherOccupation: "Doctor",
      motherName: "Sunita Joshi",
      motherOccupation: "Ayurveda Practitioner",
      siblings: 2,
      familyType: "nuclear",
      gotra: "Bharadwaja",
      subcaste: "Deshastha",
      ishtaDevata: "Krishna"
    },
    horoscope: {
      rashi: "Vrishabha",
      nakshatra: "Rohini",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1995-05-18T12:45:00",
      birthPlace: "Ahmedabad, India",
      ascendant: "Kanya",
      navamsa: "Mithuna",
      kundaliFile: "/horoscope/radhika_kundali.pdf",
      kundaliPermission: "matches",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 30
    },
    preferences: {
      ageRange: [28, 35],
      heightRange: [165, 180],
      education: ["Bachelor's", "Master's"],
      profession: ["Teacher", "Doctor", "Spiritual Leader", "Entrepreneur"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India"],
        states: ["Gujarat", "Maharashtra", "Rajasthan"],
        cities: ["Ahmedabad", "Mumbai", "Pune", "Jaipur"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Kaashyapa", "Vasishtha", "Atri"],
      subcaste: ["Deshastha", "Chitpavan", "Gaur"],
      rashi: ["Karka", "Meena", "Dhanu"],
      ishtaDevata: ["Krishna", "Vishnu", "Shiva"],
      horoscopeWeightage: {
        rashiCompatibility: 25,
        nakshatraCompatibility: 25,
        gunaMatch: 30,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-10-12"),
    isVerified: true
  },
  {
    id: "profile7",
    userId: "user7",
    name: "Rohit Mishra",
    age: 33,
    gender: "male",
    maritalStatus: "Never Married",
    height: 180,
    location: {
      country: "India",
      state: "Uttar Pradesh",
      city: "Varanasi"
    },
    about: "Professor of Sanskrit and Vedic Studies at BHU. I'm deeply connected to our ancient wisdom and traditions. I speak multiple languages including Sanskrit, Hindi, and English. I enjoy classical music, temple visits, and scholarly discussions. Looking for someone who appreciates our cultural heritage.",
    images: ["https://randomuser.me/api/portraits/men/55.jpg", "https://randomuser.me/api/portraits/men/56.jpg", "https://randomuser.me/api/portraits/men/57.jpg"],
    education: [
      {
        degree: "M.A. Sanskrit",
        institution: "Banaras Hindu University",
        year: 2013
      },
      {
        degree: "Ph.D. Vedic Studies",
        institution: "Banaras Hindu University",
        year: 2017
      }
    ],
    employment: {
      profession: "Professor",
      company: "Banaras Hindu University",
      position: "Assistant Professor",
      income: "15-18 LPA"
    },
    family: {
      fatherName: "Pandit Gopal Mishra",
      fatherOccupation: "Temple Priest",
      motherName: "Kamala Mishra",
      motherOccupation: "Homemaker",
      siblings: 1,
      familyType: "joint",
      gotra: "Kaashyapa",
      subcaste: "Kanyakubja",
      ishtaDevata: "Vishnu"
    },
    horoscope: {
      rashi: "Dhanu",
      nakshatra: "Purva Ashadha",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1991-11-25T16:30:00",
      birthPlace: "Varanasi, India",
      ascendant: "Meena",
      navamsa: "Simha",
      kundaliFile: "/horoscope/rohit_kundali.pdf",
      kundaliPermission: "public",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 34
    },
    preferences: {
      ageRange: [25, 30],
      heightRange: [155, 170],
      education: ["Bachelor's", "Master's", "PhD"],
      profession: ["Teacher", "Professor", "Civil Services", "Cultural Worker"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India"],
        states: ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Delhi"],
        cities: ["Varanasi", "Allahabad", "Delhi", "Lucknow"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Bharadwaja", "Vasishtha", "Atri", "Vishvamitra"],
      subcaste: ["Kanyakubja", "Gaur", "Saryuparin"],
      rashi: ["Mesha", "Simha", "Dhanu"],
      ishtaDevata: ["Vishnu", "Krishna", "Rama"],
      horoscopeWeightage: {
        rashiCompatibility: 30,
        nakshatraCompatibility: 30,
        gunaMatch: 25,
        doshaCheck: 15
      }
    },
    createdAt: new Date("2023-11-08"),
    isVerified: true
  },
  {
    id: "profile8",
    userId: "user8",
    name: "Meera Kulkarni",
    age: 24,
    gender: "female",
    maritalStatus: "Never Married",
    height: 160,
    location: {
      country: "India",
      state: "Maharashtra",
      city: "Pune"
    },
    about: "Fresh graduate working as a biotech research scientist. I'm passionate about medical research and finding cures for genetic diseases. In my free time, I love painting, reading scientific journals, and playing the veena. Looking for someone who supports my career aspirations and shares similar values.",
    images: ["https://randomuser.me/api/portraits/women/20.jpg", "https://randomuser.me/api/portraits/women/21.jpg", "https://randomuser.me/api/portraits/women/22.jpg"],
    education: [
      {
        degree: "B.Sc Biotechnology",
        institution: "Fergusson College, Pune",
        year: 2021
      },
      {
        degree: "M.Sc Molecular Biology",
        institution: "University of Pune",
        year: 2023
      }
    ],
    employment: {
      profession: "Research Scientist",
      company: "Serum Institute of India",
      position: "Junior Research Associate",
      income: "8-12 LPA"
    },
    family: {
      fatherName: "Dr. Suresh Kulkarni",
      fatherOccupation: "Cardiologist",
      motherName: "Priya Kulkarni",
      motherOccupation: "College Principal",
      siblings: 0,
      familyType: "nuclear",
      gotra: "Atri",
      subcaste: "Deshastha",
      ishtaDevata: "Saraswati"
    },
    horoscope: {
      rashi: "Mithuna",
      nakshatra: "Ardra",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "2000-06-14T09:15:00",
      birthPlace: "Pune, India",
      ascendant: "Simha",
      navamsa: "Dhanu",
      kundaliFile: "/horoscope/meera_kundali.pdf",
      kundaliPermission: "private",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 29
    },
    preferences: {
      ageRange: [25, 32],
      heightRange: [168, 185],
      education: ["Master's", "PhD", "Professional Degree"],
      profession: ["Doctor", "Engineer", "Scientist", "Professor"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India", "USA", "UK", "Germany"],
        states: ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi"],
        cities: ["Pune", "Mumbai", "Bangalore", "Chennai"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Bharadwaja", "Kaashyapa", "Vasishtha"],
      subcaste: ["Deshastha", "Chitpavan", "Kokanastha"],
      rashi: ["Tula", "Kumbha", "Dhanu"],
      ishtaDevata: ["Saraswati", "Vishnu", "Ganesha"],
      horoscopeWeightage: {
        rashiCompatibility: 20,
        nakshatraCompatibility: 25,
        gunaMatch: 35,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-12-01"),
    isVerified: true
  },
  {
    id: "profile9",
    userId: "user9",
    name: "Karthik Bhat",
    age: 30,
    gender: "male",
    maritalStatus: "Never Married",
    height: 176,
    location: {
      country: "India",
      state: "Karnataka",
      city: "Mangalore"
    },
    about: "Civil engineer working on sustainable infrastructure projects. I'm passionate about environmental conservation and green building technologies. I practice classical music (tabla) and love trekking in the Western Ghats. Seeking a life partner who cares about our planet's future.",
    images: ["https://randomuser.me/api/portraits/men/38.jpg", "https://randomuser.me/api/portraits/men/39.jpg", "https://randomuser.me/api/portraits/men/40.jpg"],
    education: [
      {
        degree: "B.E Civil Engineering",
        institution: "NITK Surathkal",
        year: 2016
      },
      {
        degree: "M.Tech Environmental Engineering",
        institution: "IISc Bangalore",
        year: 2018
      }
    ],
    employment: {
      profession: "Civil Engineer",
      company: "L&T Construction",
      position: "Project Manager",
      income: "22-28 LPA"
    },
    family: {
      fatherName: "Ramesh Bhat",
      fatherOccupation: "Bank Officer",
      motherName: "Savitha Bhat",
      motherOccupation: "Teacher",
      siblings: 1,
      familyType: "nuclear",
      gotra: "Vishvamitra",
      subcaste: "Havyaka",
      ishtaDevata: "Ganesha"
    },
    horoscope: {
      rashi: "Karka",
      nakshatra: "Pushya",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1994-07-08T11:20:00",
      birthPlace: "Mangalore, India",
      ascendant: "Tula",
      navamsa: "Makara",
      kundaliFile: "/horoscope/karthik_kundali.pdf",
      kundaliPermission: "matches",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 31
    },
    preferences: {
      ageRange: [24, 29],
      heightRange: [155, 168],
      education: ["Bachelor's", "Master's"],
      profession: ["Engineer", "Teacher", "Environmental Scientist"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India"],
        states: ["Karnataka", "Kerala", "Tamil Nadu", "Goa"],
        cities: ["Mangalore", "Bangalore", "Kochi", "Chennai"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Kaashyapa", "Bharadwaja", "Atri"],
      subcaste: ["Havyaka", "Smartha", "Iyengar"],
      rashi: ["Vrishabha", "Kanya", "Makara"],
      ishtaDevata: ["Ganesha", "Shiva", "Devi"],
      horoscopeWeightage: {
        rashiCompatibility: 25,
        nakshatraCompatibility: 25,
        gunaMatch: 30,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-12-15"),
    isVerified: true
  },
  {
    id: "profile10",
    userId: "user10",
    name: "Ananya Pandey",
    age: 28,
    gender: "female",
    maritalStatus: "Never Married",
    height: 164,
    location: {
      country: "India",
      state: "West Bengal",
      city: "Kolkata"
    },
    about: "Investment banker with a passion for classical Bengali literature and Rabindra Sangeet. I love cultural programs, poetry, and traveling to historical places. I believe in maintaining a perfect work-life balance and value family traditions. Looking for someone who appreciates arts and culture.",
    images: ["https://randomuser.me/api/portraits/women/50.jpg", "https://randomuser.me/api/portraits/women/51.jpg", "https://randomuser.me/api/portraits/women/52.jpg"],
    education: [
      {
        degree: "B.Com (Honors)",
        institution: "Lady Brabourne College",
        year: 2017
      },
      {
        degree: "MBA Finance",
        institution: "IIM Calcutta",
        year: 2019
      }
    ],
    employment: {
      profession: "Investment Banker",
      company: "Goldman Sachs",
      position: "Vice President",
      income: "45-50 LPA"
    },
    family: {
      fatherName: "Arun Pandey",
      fatherOccupation: "High Court Judge",
      motherName: "Madhuri Pandey",
      motherOccupation: "Classical Singer",
      siblings: 1,
      familyType: "nuclear",
      gotra: "Vasishtha",
      subcaste: "Kulin",
      ishtaDevata: "Durga"
    },
    horoscope: {
      rashi: "Tula",
      nakshatra: "Chitra",
      manglik: false,
      matchingRequired: true,
      birthDateTime: "1996-10-03T18:45:00",
      birthPlace: "Kolkata, India",
      ascendant: "Vrishabha",
      navamsa: "Mesha",
      kundaliFile: "/horoscope/ananya_kundali.pdf",
      kundaliPermission: "private",
      doshas: {
        mangal: false,
        nadi: false,
        bhakoot: false,
        gana: false
      },
      gunaPoints: 33
    },
    preferences: {
      ageRange: [28, 35],
      heightRange: [172, 185],
      education: ["Master's", "MBA", "Professional Degree"],
      profession: ["Banker", "Lawyer", "Civil Services", "Business"],
      maritalStatus: ["Never Married"],
      locationPreferences: {
        countries: ["India", "Singapore", "UK", "USA"],
        states: ["West Bengal", "Delhi", "Maharashtra", "Karnataka"],
        cities: ["Kolkata", "Delhi", "Mumbai", "Bangalore"]
      },
      manglik: false,
      excludeMyGotra: true,
      acceptedGotras: ["Bharadwaja", "Kaashyapa", "Atri"],
      subcaste: ["Kulin", "Rarhi", "Barendra"],
      rashi: ["Mesha", "Simha", "Dhanu"],
      ishtaDevata: ["Durga", "Kali", "Vishnu"],
      horoscopeWeightage: {
        rashiCompatibility: 20,
        nakshatraCompatibility: 20,
        gunaMatch: 40,
        doshaCheck: 20
      }
    },
    createdAt: new Date("2023-12-20"),
    isVerified: true
  }
];
