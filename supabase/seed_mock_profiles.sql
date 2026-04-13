-- Brahmin Soulmate Mock Data Seed Script
-- TO RUN: Paste into Supabase SQL Editor or run via CLI
-- Pre-requisite: Profiles table must exist

-- 1. Mock Super Admin
-- INSERT INTO admin_roles (user_id, role, permissions) VALUES ('your-uuid-here', 'super_admin', '{"all"}');

-- 2. Mock Professional Profiles (Assumes auth.users exist or using placeholders)
-- Note: Replace UUIDs with actual auth.users if testing in a real environment
-- Below we use a temporary function to generate mock data

DO $$
DECLARE
    u_id UUID;
BEGIN
    -- Profile 1: Male, Bharadwaj Gotra, Software Engineer
    INSERT INTO profiles (user_id, first_name, last_name, gender, age, caste, gotra, location_city, education_level, occupation, income_range, marital_status, about_me)
    VALUES (gen_random_uuid(), 'Rahul', 'Sharma', 'male', 28, 'Brahmin', 'Bharadwaj', 'Bangalore', 'Masters', 'Software Engineer', '20LPA+', 'never_married', 'Seeking a compatible life partner who values both tradition and modern outlook.')
    RETURNING user_id INTO u_id;
    
    -- Profile 2: Female, Kashyap Gotra, Doctor
    INSERT INTO profiles (user_id, first_name, last_name, gender, age, caste, gotra, location_city, education_level, occupation, income_range, marital_status, about_me)
    VALUES (gen_random_uuid(), 'Ananya', 'Iyer', 'female', 26, 'Brahmin', 'Kashyap', 'Chennai', 'Doctor', 'Pediatrician', '15LPA+', 'never_married', 'Loving family-oriented person looking for a soulful connection.');

    -- Profile 3: Male, Bharadwaj Gotra (TEST CASE FOR VETO)
    INSERT INTO profiles (user_id, first_name, last_name, gender, age, caste, gotra, location_city, education_level, occupation, income_range, marital_status, about_me)
    VALUES (gen_random_uuid(), 'Aditya', 'Mishra', 'male', 29, 'Brahmin', 'Bharadwaj', 'Delhi', 'MBA', 'Marketing Manager', '12LPA+', 'never_married', 'Simple and down to earth person.');

    -- Profile 4: Female, Vashistha Gotra
    INSERT INTO profiles (user_id, first_name, last_name, gender, age, caste, gotra, location_city, education_level, occupation, income_range, marital_status, about_me)
    VALUES (gen_random_uuid(), 'Sneha', 'Trivedi', 'female', 25, 'Brahmin', 'Vashistha', 'Mumbai', 'Bachelors', 'Graphic Designer', '8LPA+', 'never_married', 'A creative soul looking for her muse.');

    -- Profile 5: Male, Sandilya Gotra
    INSERT INTO profiles (user_id, first_name, last_name, gender, age, caste, gotra, location_city, education_level, occupation, income_range, marital_status, about_me)
    VALUES (gen_random_uuid(), 'Vikram', 'Chatterjee', 'male', 31, 'Brahmin', 'Sandilya', 'Kolkata', 'PhD', 'Professor', '10LPA+', 'never_married', 'Academician with a love for classical music.');
END $$;
