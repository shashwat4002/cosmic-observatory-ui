import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCurrentUser } from "./use-auth";

export type Project = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  currentStage?: string | null;
  createdAt: string;
  updatedAt: string;
  stages: StageProgress[];
};

export type StageProgress = {
  id: string;
  stage: string;
  completion: number;
  milestoneTitle?: string | null;
  milestoneDueDate?: string | null;
  notes?: string | null;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
};

export type DashboardStats = {
  totalProjects: number;
  activeProjects: number;
  completedStages: number;
  totalStages: number;
  overallProgress: number;
  upcomingMilestones: Milestone[];
  recentActivity: ActivityItem[];
  currentProject: Project | null;
  unreadNotifications: number;
};

export type Milestone = {
  projectId: string;
  projectTitle: string;
  stage: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
};

export type ActivityItem = {
  id: string;
  action: string;
  timestamp: string;
  type: "stage_complete" | "feedback" | "document" | "milestone";
};

// Ordered research stages
export const RESEARCH_STAGES = [
  "EXPLORATION",
  "TOPIC_DISCOVERY",
  "LITERATURE_REVIEW",
  "METHODOLOGY",
  "EXECUTION",
  "DOCUMENTATION",
  "PUBLICATION",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  EXPLORATION: "Exploration",
  TOPIC_DISCOVERY: "Topic Discovery",
  LITERATURE_REVIEW: "Literature Review",
  METHODOLOGY: "Methodology",
  EXECUTION: "Execution",
  DOCUMENTATION: "Documentation",
  PUBLICATION: "Publication",
};

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<{ projects: Project[] }>("/projects"),
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<{ notifications: Notification[] }>("/notifications"),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useDashboardStats = () => {
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();
  const { data: userData } = useCurrentUser();

  const projects = projectsData?.projects || [];
  const notifications = notificationsData?.notifications || [];

  // Calculate dashboard statistics from real data
  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === "active").length,
    completedStages: 0,
    totalStages: 0,
    overallProgress: 0,
    upcomingMilestones: [],
    recentActivity: [],
    currentProject: null,
    unreadNotifications: notifications.filter(n => !n.readAt).length,
  };

  if (projects.length > 0) {
    // Find current/most recently updated project
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    stats.currentProject = sortedProjects[0];

    // Calculate stage progress
    let totalCompletion = 0;
    let stageCount = 0;

    projects.forEach(project => {
      const projectStages = project.stages || [];
      
      projectStages.forEach(stage => {
        if (stage.completion === 100) {
          stats.completedStages++;
        }
        totalCompletion += stage.completion;
        stageCount++;

        // Check for upcoming milestones
        if (stage.milestoneDueDate && stage.milestoneTitle) {
          const dueDate = new Date(stage.milestoneDueDate);
          const now = new Date();
          const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysRemaining >= 0 && daysRemaining <= 30) {
            stats.upcomingMilestones.push({
              projectId: project.id,
              projectTitle: project.title,
              stage: stage.stage,
              title: stage.milestoneTitle,
              dueDate: stage.milestoneDueDate,
              daysRemaining,
            });
          }
        }
      });

      stats.totalStages += RESEARCH_STAGES.length;
    });

    // Calculate overall progress
    if (stageCount > 0) {
      stats.overallProgress = Math.round(totalCompletion / stageCount);
    }

    // Sort milestones by due date
    stats.upcomingMilestones.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  return {
    stats,
    projects,
    notifications,
    isLoading: projectsLoading || notificationsLoading,
    user: userData?.user,
  };
};

// Generate smart tasks based on pipeline progress
export const useWeeklyTasks = () => {
  const { projects, isLoading } = useDashboardStats();

  const tasks: {
    id: string;
    description: string;
    stage: string;
    projectTitle: string;
    projectId: string;
    priority: "high" | "medium" | "low";
    estimatedTime: string;
  }[] = [];

  if (!isLoading && projects.length > 0) {
    projects.forEach(project => {
      const stages = project.stages || [];
      const stageMap = new Map(stages.map(s => [s.stage, s]));

      // Find current stage (first incomplete one)
      for (const stageName of RESEARCH_STAGES) {
        const stageData = stageMap.get(stageName);
        const completion = stageData?.completion || 0;

        if (completion < 100) {
          // Generate tasks based on stage
          const stageTasks = getTasksForStage(stageName, completion, project.id, project.title);
          tasks.push(...stageTasks);
          break; // Only generate tasks for current stage
        }
      }
    });
  }

  return { tasks, isLoading };
};

function getTasksForStage(
  stage: string, 
  completion: number, 
  projectId: string, 
  projectTitle: string
) {
  const tasks: {
    id: string;
    description: string;
    stage: string;
    projectTitle: string;
    projectId: string;
    priority: "high" | "medium" | "low";
    estimatedTime: string;
  }[] = [];

  const tasksByStage: Record<string, { description: string; estimatedTime: string }[]> = {
    EXPLORATION: [
      { description: "Explore 3 potential research areas", estimatedTime: "2-3 hours" },
      { description: "Read introductory materials on your field", estimatedTime: "1-2 hours" },
      { description: "Identify key researchers in your area", estimatedTime: "30 min" },
    ],
    TOPIC_DISCOVERY: [
      { description: "Narrow down to 2-3 specific topics", estimatedTime: "1-2 hours" },
      { description: "Write a problem statement draft", estimatedTime: "1 hour" },
      { description: "Discuss topic ideas with mentor", estimatedTime: "30 min" },
    ],
    LITERATURE_REVIEW: [
      { description: "Find 10 relevant papers on your topic", estimatedTime: "2-3 hours" },
      { description: "Create annotated bibliography", estimatedTime: "2 hours" },
      { description: "Identify research gaps", estimatedTime: "1 hour" },
    ],
    METHODOLOGY: [
      { description: "Define research questions", estimatedTime: "1 hour" },
      { description: "Choose research methodology", estimatedTime: "1-2 hours" },
      { description: "Create data collection plan", estimatedTime: "1 hour" },
    ],
    EXECUTION: [
      { description: "Begin data collection", estimatedTime: "varies" },
      { description: "Document progress daily", estimatedTime: "15 min/day" },
      { description: "Analyze initial results", estimatedTime: "2-3 hours" },
    ],
    DOCUMENTATION: [
      { description: "Write introduction section", estimatedTime: "2-3 hours" },
      { description: "Document methodology", estimatedTime: "1-2 hours" },
      { description: "Format citations", estimatedTime: "1 hour" },
    ],
    PUBLICATION: [
      { description: "Finalize manuscript", estimatedTime: "2-3 hours" },
      { description: "Choose target journal/conference", estimatedTime: "30 min" },
      { description: "Prepare submission materials", estimatedTime: "1 hour" },
    ],
  };

  const stageSpecificTasks = tasksByStage[stage] || [];
  const tasksToShow = completion < 33 ? 3 : completion < 66 ? 2 : 1;

  stageSpecificTasks.slice(0, tasksToShow).forEach((task, index) => {
    tasks.push({
      id: `${projectId}-${stage}-${index}`,
      description: task.description,
      stage,
      projectTitle,
      projectId,
      priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
      estimatedTime: task.estimatedTime,
    });
  });

  return tasks;
}
