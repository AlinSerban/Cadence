import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import type {
  ActivityHistoryItem,
  NewActivity,
  TodaySummary,
} from "../types/tracking";
import type {
  CustomActivity,
  CreateActivityRequest,
  UpdateActivityRequest,
  NewActivityLog,
} from "../types/customActivities";
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalProgress,
} from "../types/goals";
import type { ActivityCard, BoardColumn, CreateCardRequest, CreateColumnRequest, Badge } from '../types/activityBoard';
import { addXp, levelUp } from "./slices/xpSlice";
import { addBadges } from "./slices/badgeSlice";
const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface TrackResponse {
  message: string;
  xpGained: number;
  totalXp: number;
  unlockedBadges: Badge[];
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${ENDPOINT}/api`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Activity", "Goal", "Dash", "Board", "Badges"],
  endpoints: (builder) => ({
    // ----- DASHBOARD -----
    getTodaySummary: builder.query<TodaySummary, void>({
      query: () => "track/summary/today",
      providesTags: ["Dash"],
    }),

    // ----- CUSTOM ACTIVITIES -----
    getCustomActivities: builder.query<CustomActivity[], void>({
      query: () => "activities",
      providesTags: ["Activity"],
    }),

    createActivity: builder.mutation<CustomActivity, CreateActivityRequest>({
      query: (body) => ({
        url: "activities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Activity"],
    }),

    updateActivity: builder.mutation<CustomActivity, UpdateActivityRequest>({
      query: ({ id, ...body }) => ({
        url: `activities/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Activity"],
    }),

    deleteActivity: builder.mutation<void, string>({
      query: (id) => ({
        url: `activities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Activity"],
    }),

    // ----- ACTIVITY LOGS -----
    getActivityHistory: builder.query<ActivityHistoryItem[], void>({
      query: () => "activities/history",
      providesTags: ["Activity"],
    }),

    addActivityLog: builder.mutation<TrackResponse, NewActivityLog>({
      query: (body) => ({
        url: "activities/log",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Activity", "Dash"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const prevLevel = (getState() as RootState).xp.level;
          const { data } = await queryFulfilled;
          dispatch(addXp(data.xpGained));
          const newLevel = (getState() as RootState).xp.level;
          if (newLevel > prevLevel) {
            dispatch(levelUp());
          }
          if (data.unlockedBadges.length) {
            dispatch(addBadges(data.unlockedBadges));
          }
        } catch {
          console.error("Failed to add xp - addActivityLog");
        }
      },
    }),

    // ----- GOALS -----
    getGoals: builder.query<Goal[], void>({
      query: () => "goals",
      providesTags: ["Goal"],
    }),

    createGoal: builder.mutation<Goal, CreateGoalRequest>({
      query: (body) => ({
        url: "goals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Goal"],
    }),

    updateGoal: builder.mutation<Goal, UpdateGoalRequest>({
      query: ({ id, ...body }) => ({
        url: `goals/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Goal"],
    }),

    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({
        url: `goals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Goal"],
    }),

    getGoalProgress: builder.query<GoalProgress[], void>({
      query: () => "goals/progress",
      providesTags: ["Goal"],
    }),


    // ----- ACTIVITY BOARD -----
    getBoardData: builder.query<{ cards: ActivityCard[]; columns: BoardColumn[] }, string>({
      query: (date) => `board/${date}`,
      providesTags: ["Board"],
    }),

    // ----- BADGES -----
    getUserBadges: builder.query<{ badges: Badge[] }, void>({
      query: () => 'badges/user',
      providesTags: ['Badges'],
    }),

    getAllBadges: builder.query<{ badges: Badge[] }, void>({
      query: () => 'badges/all',
      providesTags: ['Badges'],
    }),
    getBoardHistory: builder.query<{ cards: ActivityCard[] }, number>({
      query: (days) => `board/history/${days}`,
      providesTags: ["Board"],
    }),
    testBoardData: builder.query<{ totalCards: number; recentCards: ActivityCard[] }, void>({
      query: () => `board/test`,
      providesTags: ["Board"],
    }),
    createCard: builder.mutation<ActivityCard, CreateCardRequest>({
      query: (card) => ({
        url: "board/cards",
        method: "POST",
        body: card,
      }),
      invalidatesTags: ["Board"],
    }),
    updateCard: builder.mutation<ActivityCard & { xpGained?: number; totalXp?: number }, { id: string; updates: Partial<ActivityCard> }>({
      query: ({ id, updates }) => ({
        url: `board/cards/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Board"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const prevLevel = (getState() as RootState).xp.level;
          const { data } = await queryFulfilled;


          // Handle XP changes if present
          if (data.xpGained && data.xpGained !== 0) {
            dispatch(addXp(data.xpGained));
            const newLevel = (getState() as RootState).xp.level;
            if (newLevel > prevLevel) {
              dispatch(levelUp());
            }
          }
        } catch (error) {
          console.error("Failed to handle XP update - updateCard", error);
        }
      },
    }),
    deleteCard: builder.mutation<void, string>({
      query: (id) => ({
        url: `board/cards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Board"],
    }),
    createColumn: builder.mutation<BoardColumn, CreateColumnRequest>({
      query: (column) => ({
        url: "board/columns",
        method: "POST",
        body: column,
      }),
      invalidatesTags: ["Board"],
    }),
    updateColumn: builder.mutation<BoardColumn, { id: string; updates: Partial<BoardColumn> }>({
      query: ({ id, updates }) => ({
        url: `board/columns/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Board"],
    }),
    deleteColumn: builder.mutation<void, string>({
      query: (id) => ({
        url: `board/columns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Board"],
    }),

    // ----- LEGACY ACTIVITY SUPPORT -----
    addActivity: builder.mutation<TrackResponse, NewActivity>({
      query: (body) => ({
        url: "track/activities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Activity", "Dash"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const prevLevel = (getState() as RootState).xp.level;
          const { data } = await queryFulfilled;
          dispatch(addXp(data.xpGained));
          const newLevel = (getState() as RootState).xp.level;
          if (newLevel > prevLevel) {
            dispatch(levelUp());
          }
          if (data.unlockedBadges.length) {
            dispatch(addBadges(data.unlockedBadges));
          }
        } catch {
          console.error("Failed to add xp - addActivity");
        }
      },
    }),
  }),
});

export const {
  // Dashboard
  useGetTodaySummaryQuery,
  // Custom Activities
  useGetCustomActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  // Activity Logs
  useGetActivityHistoryQuery,
  useAddActivityLogMutation,
  // Goals
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetGoalProgressQuery,
  // Activity Board
  useGetBoardDataQuery,
  useGetBoardHistoryQuery,
  useTestBoardDataQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  // Badges
  useGetUserBadgesQuery,
  useGetAllBadgesQuery,
  // Legacy
  useAddActivityMutation,
} = api;
