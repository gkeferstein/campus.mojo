"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseWithProgress {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  enrolled: boolean;
  progress: number;
  hasAccess: boolean;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get<CourseWithProgress[]>("/courses", token)
        .then(setCourses)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const enrolledCourses = courses.filter(c => c.enrolled);
  const availableCourses = courses.filter(c => c.hasAccess && !c.enrolled);

  return (
    <div className="container mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Willkommen zurück{user?.firstName ? `, ${user.firstName}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground">
          Setze dein Lernen fort oder entdecke neue Kurse.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Aktive Kurse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrolledCourses.length > 0
                      ? Math.round(
                          enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
                            enrolledCourses.length
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Durchschnittlicher Fortschritt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Verfügbare Kurse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Lernen fortsetzen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <Card className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer h-full">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg mb-4 overflow-hidden">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fortschritt</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Verfügbare Kurse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <Card className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer h-full">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg mb-4 overflow-hidden">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Kurs starten</Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm text-center p-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Keine Kurse verfügbar</h3>
          <p className="text-muted-foreground">
            Du hast noch keinen Zugang zu Kursen. Kontaktiere uns, um loszulegen.
          </p>
        </Card>
      )}
    </div>
  );
}
