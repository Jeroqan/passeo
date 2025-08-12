"use client";
import dynamic from 'next/dynamic';

const UserDropdown = dynamic(() => import("@/components/UserDropdown"), {
  ssr: false,
  loading: () => <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '50%' }}></div>
});

export default function DynamicUserDropdown(props: any) {
  return <UserDropdown {...props} />;
} 