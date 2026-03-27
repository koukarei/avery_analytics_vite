import React, { createContext, useState } from "react";
import type { Course } from '../types/user';
import { CourseAPI } from "../api/Course";

type CourseContextType = {
  courses: Course[];
  loading: boolean;
  fetchCourses: () => Promise<void>;
};

export const CourseContext = createContext({} as CourseContextType);

export const CourseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const courseList = await CourseAPI.fetchCourseList({skip: 0, limit: 100});
      setCourses(courseList);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <CourseContext.Provider value={{ courses, loading, fetchCourses }}>
      {children}
    </CourseContext.Provider>
  );
};
