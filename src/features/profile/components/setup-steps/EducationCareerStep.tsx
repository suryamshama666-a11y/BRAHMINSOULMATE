import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase, Plus, Trash2 } from 'lucide-react';

type Education = {
  id: string;
  degree: string;
  field: string;
  institution: string;
  year: string;
  grade: string;
};

type EducationCareerStepProps = {
  data: {
    education: Education[];
    currentOccupation: string;
    designation: string;
    company: string;
    workLocation: string;
    experience: string;
    annualIncome: string;
    workingWith: string;
    aboutCareer: string;
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

const DEGREE_OPTIONS = [
  'High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 
  'PhD', 'Professional Degree', 'Certificate Course', 'Other'
];

const FIELD_OPTIONS = [
  'Engineering', 'Medicine', 'Commerce', 'Arts', 'Science', 'Law',
  'Management', 'Computer Science', 'Information Technology', 'Finance',
  'Marketing', 'Human Resources', 'Architecture', 'Design', 'Other'
];

const OCCUPATION_OPTIONS = [
  'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Lawyer',
  'Chartered Accountant', 'Government Employee', 'Private Employee',
  'Consultant', 'Architect', 'Designer', 'Manager', 'Executive',
  'Entrepreneur', 'Freelancer', 'Student', 'Other'
];

const INCOME_RANGES = [
  'Below 2 Lakhs', '2-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs',
  '20-50 Lakhs', '50 Lakhs - 1 Crore', 'Above 1 Crore', 'Prefer not to say'
];

const WORKING_WITH_OPTIONS = [
  'Private Company', 'Government/PSU', 'Business/Self Employed',
  'Non-Profit Organization', 'Defense/Civil Services', 'Not Working'
];

export default function EducationCareerStep({ data, onUpdate, onComplete }: EducationCareerStepProps) {
  const [formData, setFormData] = useState(data);

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onUpdate(newData);
    
    // Check completion - at least one education and basic career info required
    const isCompleted = newData.education.length > 0 && 
                       newData.currentOccupation && 
                       newData.workingWith;
    onComplete(isCompleted);
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      degree: '',
      field: '',
      institution: '',
      year: '',
      grade: ''
    };
    const updatedEducation = [...formData.education, newEducation];
    updateFormData({ education: updatedEducation });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    const updatedEducation = formData.education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateFormData({ education: updatedEducation });
  };

  const removeEducation = (id: string) => {
    const updatedEducation = formData.education.filter(edu => edu.id !== id);
    updateFormData({ education: updatedEducation });
  };

  return (
    <div className="space-y-6">
      {/* Education Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold">Education Details</h3>
            </div>
            <Button onClick={addEducation} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>

          {formData.education.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No education details added yet</p>
              <Button onClick={addEducation} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Education
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.education.map((edu, index) => (
                <Card key={edu.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      {formData.education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(edu.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Degree *</Label>
                        <Select 
                          value={edu.degree} 
                          onValueChange={(value) => updateEducation(edu.id, 'degree', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEGREE_OPTIONS.map((degree) => (
                              <SelectItem key={degree} value={degree}>
                                {degree}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Field of Study</Label>
                        <Select 
                          value={edu.field} 
                          onValueChange={(value) => updateEducation(edu.id, 'field', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OPTIONS.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Institution/University</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="Enter institution name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Year of Completion</Label>
                        <Select 
                          value={edu.year} 
                          onValueChange={(value) => updateEducation(edu.id, 'year', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 30 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label>Grade/Percentage</Label>
                        <Input
                          value={edu.grade}
                          onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                          placeholder="e.g., First Class, 85%, 8.5 CGPA"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Career Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Occupation *</Label>
              <Select 
                value={formData.currentOccupation} 
                onValueChange={(value) => updateFormData({ currentOccupation: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Working With *</Label>
              <Select 
                value={formData.workingWith} 
                onValueChange={(value) => updateFormData({ workingWith: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  {WORKING_WITH_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Designation/Position</Label>
              <Input
                value={formData.designation}
                onChange={(e) => updateFormData({ designation: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Company/Organization</Label>
              <Input
                value={formData.company}
                onChange={(e) => updateFormData({ company: e.target.value })}
                placeholder="Enter company name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Work Location</Label>
              <Input
                value={formData.workLocation}
                onChange={(e) => updateFormData({ workLocation: e.target.value })}
                placeholder="City where you work"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Total Experience</Label>
              <Select 
                value={formData.experience} 
                onValueChange={(value) => updateFormData({ experience: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fresher">Fresher</SelectItem>
                  <SelectItem value="1-2 years">1-2 years</SelectItem>
                  <SelectItem value="3-5 years">3-5 years</SelectItem>
                  <SelectItem value="6-10 years">6-10 years</SelectItem>
                  <SelectItem value="11-15 years">11-15 years</SelectItem>
                  <SelectItem value="16-20 years">16-20 years</SelectItem>
                  <SelectItem value="20+ years">20+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Annual Income</Label>
              <Select 
                value={formData.annualIncome} 
                onValueChange={(value) => updateFormData({ annualIncome: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Career */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Your Career</h3>

            <div>
              <Label htmlFor="aboutCareer">Tell us about your career journey</Label>
              <Textarea
                id="aboutCareer"
                placeholder="Share about your career achievements, goals, work culture, and professional aspirations..."
                value={formData.aboutCareer}
                onChange={(e) => updateFormData({ aboutCareer: e.target.value })}
                className="min-h-[100px] mt-2"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.aboutCareer.length}/500 characters
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What to include:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your career achievements and milestones</li>
                <li>• Professional goals and aspirations</li>
                <li>• Work-life balance preferences</li>
                <li>• Skills and expertise areas</li>
                <li>• Future career plans</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium mb-2">Section Completion</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.education.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Education Details ({formData.education.length > 0 ? 'Complete' : 'Incomplete'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.currentOccupation ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Current Occupation ({formData.currentOccupation ? 'Complete' : 'Incomplete'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.workingWith ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Work Type ({formData.workingWith ? 'Complete' : 'Incomplete'})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
