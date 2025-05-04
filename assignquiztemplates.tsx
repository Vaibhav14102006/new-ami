import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { quizTemplates, QuizTemplate } from "@/lib/quizTemplates";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createQuiz } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Clock, Users, BookOpen, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AssignQuizTemplateProps {
  onQuizAssigned?: () => void;
}

export default function AssignQuizTemplate({ onQuizAssigned }: AssignQuizTemplateProps) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuizTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    startTime: "",
    endTime: "",
    targetAudience: {
      programme: [] as string[],
      branch: [] as string[],
      section: [] as string[],
      group: [] as string[],
    },
  });

  const handleTemplateSelect = (template: QuizTemplate) => {
    setSelectedTemplate(template);
    setQuizDetails(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      timeLimit: template.timeLimit,
    }));
  };

  const handleAssign = async () => {
    if (!selectedTemplate || !userData) return;

    try {
      setIsLoading(true);

      const quizData = {
        ...quizDetails,
        teacherId: userData.uid,
        teacherName: userData.displayName || "Anonymous Teacher",
        questions: selectedTemplate.questions,
        isLive: false,
        createdAt: new Date(),
        startTime: quizDetails.startTime ? new Date(quizDetails.startTime) : null,
        endTime: quizDetails.endTime ? new Date(quizDetails.endTime) : null,
      };

      await createQuiz(quizData);

      toast({
        title: "Quiz assigned successfully",
        description: "The quiz has been created and is ready to be published.",
      });

      setIsOpen(false);
      onQuizAssigned?.();
    } catch (error) {
      console.error("Error assigning quiz:", error);
      toast({
        variant: "destructive",
        title: "Error assigning quiz",
        description: "There was a problem creating the quiz. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <BookOpen className="mr-2 h-4 w-4" />
          Assign Quiz Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-white rounded-xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Assign Quiz Template
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select a quiz template and customize it for your students
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8">
          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Available Templates
            </h3>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {quizTemplates.map((template, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      selectedTemplate?.title === template.title
                        ? "border-2 border-blue-500 shadow-lg"
                        : "hover:border-blue-300 hover:shadow-md"
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800">
                            {template.title}
                          </CardTitle>
                          <CardDescription className="mt-2 text-gray-600">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {template.subject}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{template.timeLimit} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span>{template.questions.length} questions</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Quiz Details Form */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Quiz Details
            </h3>
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={quizDetails.title}
                  onChange={(e) =>
                    setQuizDetails((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Input
                  id="description"
                  value={quizDetails.description}
                  onChange={(e) =>
                    setQuizDetails((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit" className="text-gray-700">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={quizDetails.timeLimit}
                    onChange={(e) =>
                      setQuizDetails((prev) => ({
                        ...prev,
                        timeLimit: parseInt(e.target.value) || 30,
                      }))
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-gray-700">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={quizDetails.startTime}
                    onChange={(e) =>
                      setQuizDetails((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-700">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={quizDetails.endTime}
                  onChange={(e) =>
                    setQuizDetails((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <Label className="text-gray-700 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Target Audience
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="programme" className="text-gray-700">Programme</Label>
                    <Select
                      onValueChange={(value) =>
                        setQuizDetails((prev) => ({
                          ...prev,
                          targetAudience: {
                            ...prev.targetAudience,
                            programme: [value],
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select programme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="btech">B.Tech</SelectItem>
                        <SelectItem value="mtech">M.Tech</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-gray-700">Branch</Label>
                    <Select
                      onValueChange={(value) =>
                        setQuizDetails((prev) => ({
                          ...prev,
                          targetAudience: {
                            ...prev.targetAudience,
                            branch: [value],
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cse">Computer Science</SelectItem>
                        <SelectItem value="ece">Electronics</SelectItem>
                        <SelectItem value="me">Mechanical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedTemplate || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? "Assigning..." : "Assign Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 