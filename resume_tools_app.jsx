import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Upload, Sparkles } from "lucide-react";

export default function ResumeToolsApp() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("concise");
  const [reviewResult, setReviewResult] = useState("");
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [atsScore, setATSScore] = useState(null);

  const handleReview = async () => {
    const res = await fetch("/api/review", {
      method: "POST",
      body: JSON.stringify({ resumeText, role }),
    });
    const data = await res.json();
    setReviewResult(data.review);
    setATSScore(data.atsScore);
  };

  const handleRewrite = async () => {
    const res = await fetch("/api/rewrite", {
      method: "POST",
      body: JSON.stringify({ resumeText, tone }),
    });
    const data = await res.json();
    setRewrittenResume(data.rewritten);
  };

  const handleCoverLetter = async () => {
    const res = await fetch("/api/coverletter", {
      method: "POST",
      body: JSON.stringify({ resumeText, role }),
    });
    const data = await res.json();
    setCoverLetter(data.cover);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI Resume Assistant</h1>
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
          <TabsTrigger value="cover">Cover Letter</TabsTrigger>
          <TabsTrigger value="parser">JD Parser</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <Input
                placeholder="Target role (e.g., Software Engineer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <Button onClick={handleReview}>
                <Sparkles className="mr-2" /> Get Review
              </Button>
              {reviewResult && (
                <div>
                  <h2 className="font-semibold">Feedback:</h2>
                  <p>{reviewResult}</p>
                  <p className="mt-2">Predicted ATS Score: {atsScore}/100</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewrite">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="concise">Concise</option>
                <option value="formal">Formal</option>
                <option value="achievement-focused">Achievement-focused</option>
              </select>
              <Button onClick={handleRewrite}>Rewrite Resume</Button>
              {rewrittenResume && (
                <Textarea value={rewrittenResume} readOnly rows={10} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <Input
                placeholder="Target role (e.g., Product Manager)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <Button onClick={handleCoverLetter}>Generate Cover Letter</Button>
              {coverLetter && (
                <Textarea value={coverLetter} readOnly rows={10} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parser">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button
                onClick={async () => {
                  const res = await fetch("/api/parser", {
                    method: "POST",
                    body: JSON.stringify({ jobDescription }),
                  });
                  const data = await res.json();
                  alert("Must-have skills: " + data.skills.join(", "));
                }}
              >
                Extract Skills
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
