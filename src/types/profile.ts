
import { 
  ProfileLocation, 
  ProfileEducation, 
  ProfileEmployment, 
  ProfileFamily, 
  ProfileHoroscope, 
  ProfilePreference 
} from '@/data/profileTypes';
import { RashiValue } from '@/data/profileData';

export type ProfileGender = 'male' | 'female';

export type ProfileMaritalStatus = 
  | 'Never Married' 
  | 'Widowed' 
  | 'Divorced' 
  | 'Separated' 
  | 'Awaiting Divorce';

export type BrahminSubcaste = 
  | 'Adi Gaur' | 'Anavil' | 'Andhra Brahmin' | 'Babburu' | 'Bardai' | 'Barendra' 
  | 'Bhatt' | 'Bhumihar' | 'Chitpavan' | 'Dadhich' | 'Daivadnya' | 'Danua' 
  | 'Deshastha' | 'Devarukhe' | 'Dhima' | 'Dravida' | 'Gaur' | 'Gowd Saraswat' 
  | 'Gurukkal' | 'Havyaka' | 'Hoysala' | 'Iyer' | 'Iyengar' | 'Jangid' | 'Jhadua' 
  | 'Jyotish' | 'Kanyakubja' | 'Karhade' | 'Kashmiri Pandit' | 'Kokanastha' 
  | 'Kota' | 'Kulin' | 'Maithil' | 'Nagar' | 'Namboodiri' | 'Niyogi' | 'Panda' 
  | 'Rarhi' | 'Rigvedi' | 'Sakaldwipi' | 'Sanadya' | 'Sanketi' | 'Saryuparin' 
  | 'Smartha' | 'Sri Vaishnava' | 'Sthanika' | 'Tyagi' | 'Uriya' | 'Vaidiki' 
  | 'Velanadu' | 'Viswa' | 'Other';

export type Gotra = 
  | 'Agastya' | 'Angirasa' | 'Atri' | 'Bharadwaja' | 'Bhargava' | 'Bhrigu' 
  | 'Dhanvantari' | 'Gautama' | 'Gritsamada' | 'Jamadagni' | 'Kaashyapa' | 'Kaushika' 
  | 'Kutsa' | 'Maitreya' | 'Marichi' | 'Mudgala' | 'Parashar' | 'Pulaha' 
  | 'Pulastya' | 'Sankrithi' | 'Shandilya' | 'Upamanyu' | 'Vasishtha' | 'Vatsa' 
  | 'Vishvamitra' | 'Other';

export type IshtaDevata = 
  | 'Ganesha' | 'Shiva' | 'Vishnu' | 'Krishna' | 'Rama' | 'Hanuman' 
  | 'Devi' | 'Durga' | 'Lakshmi' | 'Saraswati' | 'Kali' | 'Kartikeya' 
  | 'Ayyappa' | 'Surya' | 'Other';

export type Rashi = RashiValue;

export type Profile = {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: ProfileGender;
  maritalStatus: ProfileMaritalStatus;
  height: number;
  location: ProfileLocation;
  about: string;
  images: string[];
  education: ProfileEducation[];
  employment: ProfileEmployment;
  family: ProfileFamily;
  horoscope?: ProfileHoroscope;
  preferences?: ProfilePreference;
  createdAt: Date;
  isVerified: boolean;
};

export * from '@/data/profileTypes';
