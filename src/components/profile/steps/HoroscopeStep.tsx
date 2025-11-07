
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Info } from 'lucide-react';

interface HoroscopeStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export const HoroscopeStep: React.FC<HoroscopeStepProps> = ({
  data,
  onNext,
  onBack,
  canGoBack,
  loading
}) => {
  const [formData, setFormData] = useState({
    birth_time: data.birth_time || '',
    birth_place: data.birth_place || '',
    rashi: data.rashi || '',
    nakshatra: data.nakshatra || '',
    manglik: data.manglik || false,
    kundali_url: data.kundali_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const rashis = [
    'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
    'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
    'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
  ];

  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Star className="h-5 w-5" />
            Enhanced Compatibility Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-700">
              <p className="mb-2">
                Your horoscope details will be used for advanced compatibility matching with potential partners.
              </p>
              <p>
                Our system calculates Guna Milan scores, Rashi compatibility, and Dosha analysis to help you find the most compatible matches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Birth Time">
            <Input
              type="time"
              value={formData.birth_time}
              onChange={(e) => updateField('birth_time', e.target.value)}
            />
          </FormField>

          <FormField label="Birth Place">
            <Input
              value={formData.birth_place}
              onChange={(e) => updateField('birth_place', e.target.value)}
              placeholder="City, State, Country"
            />
          </FormField>

          <FormField label="Rashi (Moon Sign)">
            <Select value={formData.rashi} onValueChange={(value) => updateField('rashi', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select rashi" />
              </SelectTrigger>
              <SelectContent>
                {rashis.map((rashi) => (
                  <SelectItem key={rashi} value={rashi}>{rashi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Nakshatra">
            <Select value={formData.nakshatra} onValueChange={(value) => updateField('nakshatra', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select nakshatra" />
              </SelectTrigger>
              <SelectContent>
                {nakshatras.map((nakshatra) => (
                  <SelectItem key={nakshatra} value={nakshatra}>{nakshatra}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Kundali/Horoscope File URL" description="Upload your kundali to a cloud service and paste the link">
            <Input
              value={formData.kundali_url}
              onChange={(e) => updateField('kundali_url', e.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="manglik"
            checked={formData.manglik}
            onCheckedChange={(checked) => updateField('manglik', checked)}
          />
          <Label htmlFor="manglik">
            I am Manglik
          </Label>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
          >
            Back
          </Button>
          <Button type="submit" disabled={loading}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};
