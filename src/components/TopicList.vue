<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800">
        Topics ({{ totalCount }})
      </h2>

      <div class="flex space-x-2">
        <input type="text" v-model="searchQuery"
          class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search topics..." @input="$emit('search', searchQuery)" />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading topics...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="topics.length === 0" class="text-center py-8 text-gray-500">
      <p>No topics found. Create a new topic to get started.</p>
    </div>

    <!-- Topics list -->
    <ul v-else class="divide-y divide-gray-200">
      <li v-for="topic in topics" :key="topic.guid" class="py-4">
        <div class="flex justify-between">
          <div class="w-full">
            <div class="flex justify-between">
              <h3 class="text-lg font-medium text-gray-900">{{ topic.name }}</h3>
              <div class="flex space-x-2">
                <button @click="$emit('edit', topic)" class="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  title="Edit Topic">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button @click="$emit('delete', topic.guid)"
                  class="p-1 text-red-600 hover:text-red-800 focus:outline-none" title="Delete Topic">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Comments component -->
            <CommentList :comments="topic.comments" :topic-guid="topic.guid" @comment-add="$emit('comment-add', $event)"
              @comment-update="$emit('comment-update', $event)" @comment-delete="$emit('comment-delete', $event)" />
          </div>
        </div>
      </li>
    </ul>

    <!-- Pagination -->
    <div v-if="!loading && totalCount > 0" class="mt-6 flex justify-between items-center">
      <div class="text-sm text-gray-500">
        Showing {{ (currentPage - 1) * 20 + 1 }}-{{ Math.min(currentPage * 20, totalCount) }} of {{ totalCount }} topics
      </div>

      <div class="flex space-x-2">
        <button @click="$emit('page-change', currentPage - 1)" :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
          Previous
        </button>

        <span class="px-3 py-1 border border-gray-300 rounded-md bg-gray-50">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button @click="$emit('page-change', currentPage + 1)" :disabled="currentPage === totalPages"
          class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import CommentList from './CommentList.vue';

// Define props
const props = defineProps({
  topics: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  totalCount: {
    type: Number,
    default: 0
  }
});

// Define events
defineEmits([
  'edit',
  'delete',
  'search',
  'page-change',
  'comment-add',
  'comment-update',
  'comment-delete'
]);

// Local search query
const searchQuery = ref('');
</script>