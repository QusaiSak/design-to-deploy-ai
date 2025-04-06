
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/clerk-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heart, Mail, User, BellRing, Moon, Sun, Github } from 'lucide-react';

export default function Settings() {
  const { user } = useUser();
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container py-6 mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
              <AvatarFallback>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">
                  Full Name
                </Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>{user.fullName}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                  Email
                </Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>{user.primaryEmailAddress?.emailAddress}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline">
                Manage Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your application experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for the application
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch id="dark-mode" />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your projects
              </p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>
            Details about the AI models and API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Available Models</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">DeepSeek Chat v3</Badge>
                <Badge variant="outline">Gemini 2.5 Pro</Badge>
                <Badge variant="outline">Llama 3.3 70B</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">API Status</h3>
              <Badge className="bg-green-500">Connected</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Your application is successfully connected to OpenRouter API
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center text-sm text-muted-foreground pt-4">
        <div className="flex items-center gap-1">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500" />
          <span>using Lovable</span>
        </div>
      </div>
    </div>
  );
}
