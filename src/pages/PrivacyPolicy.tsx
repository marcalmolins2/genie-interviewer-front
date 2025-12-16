import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mic, Database, Trash2, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* TLDR Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">TL;DR</CardTitle>
            </div>
            <CardDescription>The quick summary</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mic className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>Your interview is <strong>recorded and transcribed</strong> for research purposes.</span>
              </li>
              <li className="flex items-start gap-3">
                <Database className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>Your responses are <strong>stored securely</strong> and only accessible to the research team.</span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>Your data is <strong>never sold</strong> to third parties.</span>
              </li>
              <li className="flex items-start gap-3">
                <Trash2 className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>You can request <strong>deletion of your data</strong> at any time.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Full Policy */}
        <div className="space-y-6">
          <h1 className="text-3xl font-serif font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you participate in an interview, we collect audio recordings of your responses 
              and generate text transcripts. We may also collect basic metadata such as interview 
              duration and timestamp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your interview responses are used solely for the research purposes described by the 
              interviewer. Transcripts may be analyzed to extract insights, identify themes, and 
              inform business decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              All data is encrypted in transit and at rest. Access is restricted to authorized 
              research team members only. We implement industry-standard security measures to 
              protect your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Interview data is retained for the duration of the research project plus a reasonable 
              period for analysis. You may request early deletion of your data by contacting the 
              research team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data. You may also 
              withdraw consent at any time. To exercise these rights, contact the person who 
              shared the interview link with you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this privacy policy or your data, please contact the research 
              team that invited you to participate.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
