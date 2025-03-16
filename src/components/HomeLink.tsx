
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeIcon } from 'lucide-react';

const HomeLink = ({ variant = "outline" }: { variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" }) => {
  return (
    <Button variant={variant} asChild>
      <Link to="/">
        <HomeIcon className="h-4 w-4 mr-2" />
        View Home Page
      </Link>
    </Button>
  );
};

export default HomeLink;
