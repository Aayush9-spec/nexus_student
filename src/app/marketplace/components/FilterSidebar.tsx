"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { listingCategories, ListingCategory } from '@/lib/types';
import { X, MapPin } from 'lucide-react';
import { dummyUsers } from '@/lib/dummy-data';
import { Checkbox } from '@/components/ui/checkbox';

const colleges = [...new Set(dummyUsers.map(u => u.college))];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );
  
  const handleCategoryChange = (category: string) => {
    router.push(pathname + '?' + createQueryString('category', category === 'All' ? '' : category));
  };
  
  const handlePriceChange = (values: number[]) => {
      router.push(pathname + '?' + createQueryString('maxPrice', String(values[0])));
  };

  const handleCollegeChange = (college: string) => {
    const currentColleges = searchParams.get('colleges')?.split(',') || [];
    let newColleges: string[];
    if (currentColleges.includes(college)) {
        newColleges = currentColleges.filter(c => c !== college);
    } else {
        newColleges = [...currentColleges, college];
    }
    const collegeQuery = newColleges.length > 0 ? newColleges.join(',') : '';
    router.push(pathname + '?' + createQueryString('colleges', collegeQuery));
  }
  
  const clearFilters = () => {
    router.push(pathname);
  };

  const selectedCategory = searchParams.get('category') || 'All';
  const maxPrice = Number(searchParams.get('maxPrice')) || 500;
  const selectedColleges = searchParams.get('colleges')?.split(',') || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" /> Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <Label className="font-semibold">Location</Label>
            <div className="relative mt-2">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by city or zip..." className="pl-8" disabled />
            </div>
        </div>
        <div>
          <Label className="font-semibold">Category</Label>
          <RadioGroup 
            value={selectedCategory}
            onValueChange={handleCategoryChange} 
            className="mt-2 space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="All" id="cat-all" />
              <Label htmlFor="cat-all">All</Label>
            </div>
            {listingCategories.map(cat => (
              <div key={cat} className="flex items-center space-x-2">
                <RadioGroupItem value={cat} id={`cat-${cat.replace(/\s/g, '')}`} />
                <Label htmlFor={`cat-${cat.replace(/\s/g, '')}`}>{cat}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="font-semibold">College</Label>
          <div className="mt-2 space-y-1">
            {colleges.map(college => (
                <div key={college} className="flex items-center space-x-2">
                    <Checkbox 
                        id={`college-${college.replace(/\s/g, '')}`}
                        checked={selectedColleges.includes(college)}
                        onCheckedChange={() => handleCollegeChange(college)}
                    />
                    <Label htmlFor={`college-${college.replace(/\s/g, '')}`} className="font-normal">{college}</Label>
                </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="price-range" className="font-semibold">Max Price</Label>
          <div className='flex items-center gap-4 mt-2'>
            <Slider
              id="price-range"
              max={500}
              step={10}
              value={[maxPrice]}
              onValueChange={handlePriceChange}
            />
            <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
                <Input value={maxPrice} readOnly className="w-24 pl-6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
