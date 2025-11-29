
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { listingCategories, LocationDetails } from '@/lib/types';
import { X } from 'lucide-react';
import { LocationSearchInput } from './LocationSearchInput';

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (paramsToUpdate: { name: string; value: string | null }[]) => {
      const params = new URLSearchParams(searchParams.toString());
      paramsToUpdate.forEach(({ name, value }) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const selectedCategory = searchParams.get('category') || 'All';
  const maxPrice = Number(searchParams.get('maxPrice')) || 5000;
  const initialLocation = searchParams.get('location') || '';


  const handleCategoryChange = (category: string) => {
    router.push(pathname + '?' + createQueryString([{ name: 'category', value: category === 'All' ? null : category }]));
  };

  const handlePriceChange = (values: number[]) => {
    router.push(pathname + '?' + createQueryString([{ name: 'maxPrice', value: String(values[0]) }]));
  };

  const handleLocationSelect = (location: LocationDetails | null) => {
    if (location) {
      router.push(pathname + '?' + createQueryString([
        { name: 'location', value: location.formatted_address },
        { name: 'lat', value: String(location.lat) },
        { name: 'lng', value: String(location.lng) }
      ]));
    } else {
      router.push(pathname + '?' + createQueryString([
        { name: 'location', value: null },
        { name: 'lat', value: null },
        { name: 'lng', value: null }
      ]));
    }
  }


  const clearFilters = () => {
    router.push(pathname);
  };

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
          <LocationSearchInput
            onLocationSelect={handleLocationSelect}
            initialValue={initialLocation}
          />
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
          <Label htmlFor="price-range" className="font-semibold">Max Price</Label>
          <div className='flex items-center gap-4 mt-2'>
            <Slider
              id="price-range"
              max={5000}
              step={100}
              value={[maxPrice]}
              onValueChange={handlePriceChange}
            />
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground font-sans">₹</span>
              <Input value={maxPrice} readOnly className="w-24 pl-6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

