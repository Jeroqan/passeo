'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FeedbackType = 'BUG' | 'FEATURE_REQUEST' | 'GENERAL_FEEDBACK';

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('GENERAL_FEEDBACK');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSubmitDisabled = isLoading || message.trim().length < 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, page: window.location.pathname }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details?.message?.[0] || data.error || 'Bir hata oluştu.');
      }

      setSuccess(data.message || 'Geri bildiriminiz başarıyla alındı.');
      setMessage('');
      setType('GENERAL_FEEDBACK');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Geri Bildirim Gönder</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="feedback-type">Geri Bildirim Türü</Label>
              <Select onValueChange={(value: FeedbackType) => setType(value)} value={type}>
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Bir tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL_FEEDBACK">Genel Geri Bildirim</SelectItem>
                  <SelectItem value="BUG">Hata Bildirimi</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Özellik Talebi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feedback-message">Mesajınız</Label>
              <Textarea
                id="feedback-message"
                placeholder="Lütfen düşüncelerinizi detaylı bir şekilde paylaşın..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                minLength={10}
              />
            </div>
            
            {success && (
              <div role="alert" className="text-green-600 p-3 bg-green-50 border border-green-300 rounded-md">
                {success}
              </div>
            )}
            
            {error && (
              <div role="alert" className="text-red-600 p-3 bg-red-50 border border-red-300 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitDisabled}>
              {isLoading ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 