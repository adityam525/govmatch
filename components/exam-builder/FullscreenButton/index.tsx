'use client';

import { Maximize2 } from 'lucide-react';

import Button from '@/components/ui/Button';

export default function FullscreenButton() {

  function toggle() {

    if (!document.fullscreenElement) {

      document.documentElement.requestFullscreen();

    } else {

      document.exitFullscreen();

    }

  }

  return (

    <Button
      variant="secondary"
      onClick={toggle}
      icon={<Maximize2 size={18} />}
    >

      Full Screen

    </Button>

  );

}
