'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ManageSubscriptionButton() {
  return (
    <Button 
      asChild
      variant="outline"
    >
      <Link href="/subscription">
        Gérer mon abonnement
      </Link>
    </Button>
  );
}