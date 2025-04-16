<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Topic Management</h1>
      </div>

      <!-- Loading overlay -->
      <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-700">Loading topics...</p>
        </div>
      </div>

      <!-- Topic Form Component -->
      <TopicForm :topic="currentTopic" @save="handleSaveTopic" @cancel="currentTopic = null" />

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
        <button @click="error = null" class="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Topic List Component -->
      <TopicList :topics="paginatedTopics" :loading="isLoading" :current-page="currentPage" :total-pages="totalPages"
        :total-count="filteredTopics.length" @edit="handleEditTopic" @delete="handleDeleteTopic" @search="handleSearch"
        @page-change="handlePageChange" @comment-add="handleAddComment" @comment-update="handleUpdateComment"
        @comment-delete="handleDeleteComment" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TopicForm from './components/TopicForm.vue';
import TopicList from './components/TopicList.vue';
import { apiService } from './services/apiService';

const ITEMS_PER_PAGE = 20;
const topics = ref([]);
const persons = ref([]);
const rawData = ref(null);
const currentTopic = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const isLoading = ref(true);
const error = ref(null);
const dataSource = ref('');

onMounted(async () => {
  await loadData();
});

const loadData = async (forceReload = false) => {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await apiService.loadData(forceReload);
    topics.value = result.topics || [];
    persons.value = result.persons || [];
    rawData.value = result.raw || null;
    dataSource.value = result.source;
    if (result.source === 'mock' && !forceReload) {
      error.value = 'Could not connect to the topics API. Using generated mock data instead.';
    }
  } catch (e) {
    console.error('Error in loadData:', e);
    error.value = `Failed to load data: ${e.message}`;
    topics.value = [];
    persons.value = [];
    dataSource.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const saveDataToStorage = () => {
  try {
    localStorage.setItem('topicData', JSON.stringify({
      topics: topics.value,
      persons: persons.value,
      raw: rawData.value
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const filteredTopics = computed(() => {
  if (!searchQuery.value) {
    return topics.value;
  }

  const query = searchQuery.value.toLowerCase();
  return topics.value.filter(topic =>
    topic.name.toLowerCase().includes(query) ||
    topic.comments.some(comment =>
      comment.text.toLowerCase().includes(query) ||
      comment.by.toLowerCase().includes(query)
    )
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTopics.value.length / ITEMS_PER_PAGE))
);

const paginatedTopics = computed(() => {
  const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return filteredTopics.value.slice(startIndex, endIndex);
});

const handleSaveTopic = (topic) => {
  if (topic.guid) {
    const index = topics.value.findIndex(t => t.guid === topic.guid);
    if (index !== -1) {
      const updatedTopic = {
        ...topic,
        comments: topics.value[index].comments || []
      };
      topics.value[index] = updatedTopic;
      if (rawData.value && Array.isArray(rawData.value.topic)) {
        const rawIndex = rawData.value.topic.findIndex(t => t.guid === topic.guid);
        if (rawIndex !== -1) {
          rawData.value.topic[rawIndex].name = topic.name;
        }
      }
    }
  } else {
    const newGuid = `topic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newTopic = {
      guid: newGuid,
      name: topic.name.trim(),
      comments: []
    };

    topics.value.unshift(newTopic);

    if (rawData.value) {
      if (!Array.isArray(rawData.value.topic)) {
        rawData.value.topic = [];
      }

      rawData.value.topic.unshift({
        guid: newGuid,
        name: topic.name.trim(),
        comments: []
      });
    }
    currentPage.value = 1;
  }

  currentTopic.value = null;
  saveDataToStorage();
};

const handleEditTopic = (topic) => {
  currentTopic.value = { ...topic };
};

const handleDeleteTopic = (topicGuid) => {
  if (confirm('Are you sure you want to delete this topic?')) {
    const index = topics.value.findIndex(t => t.guid === topicGuid);

    if (index !== -1) {
      topics.value.splice(index, 1);

      if (rawData.value && Array.isArray(rawData.value.topic)) {
        const rawIndex = rawData.value.topic.findIndex(t => t.guid === topicGuid);
        if (rawIndex !== -1) {
          rawData.value.topic.splice(rawIndex, 1);
        }
      }

      saveDataToStorage();

      if (dataSource.value === 'api') {
        dataSource.value = 'localStorage (modified)';
      }

      if (paginatedTopics.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    }
  }
};

const handleSearch = (query) => {
  searchQuery.value = query;
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const handleAddComment = (payload) => {
  const { comment, topicGuid } = payload;

  const topicIndex = topics.value.findIndex(t => t.guid === topicGuid);
  if (topicIndex === -1) return;

  const updatedComments = [...topics.value[topicIndex].comments, comment];
  topics.value[topicIndex] = {
    ...topics.value[topicIndex],
    comments: updatedComments
  };

  if (rawData.value && Array.isArray(rawData.value.topic)) {
    const rawTopicIndex = rawData.value.topic.findIndex(t => t.guid === topicGuid);
    if (rawTopicIndex !== -1) {
      const rawComment = {
        comment: comment.text,
        date: comment.time,
        by: comment.byGuid
      };

      if (!Array.isArray(rawData.value.topic[rawTopicIndex].comments)) {
        rawData.value.topic[rawTopicIndex].comments = [];
      }

      rawData.value.topic[rawTopicIndex].comments.push(rawComment);
    }
  }

  // Save changes
  saveDataToStorage();

  // Update data source indicator
  if (dataSource.value === 'api') {
    dataSource.value = 'localStorage (modified)';
  }
};

const handleUpdateComment = (payload) => {
  const { comment, topicGuid } = payload;
  console.log('Updating comment:', comment, 'in topic:', topicGuid);
  console.log({ topics: topics.value })
  const topicIndex = topics.value.findIndex(t => t.guid == topicGuid);

  if (topicIndex === -1) return;

  let commentIndex = -1;
  commentIndex = topics.value[topicIndex].comments.findIndex(c => c.byGuid === comment.byGuid);

  if (commentIndex !== -1) {
    const updatedComments = [...topics.value[topicIndex].comments];
    updatedComments[commentIndex] = comment;
    topics.value[topicIndex] = {
      ...topics.value[topicIndex],
      comments: updatedComments
    };

    if (rawData.value && Array.isArray(rawData.value.topic)) {
      const rawTopicIndex = rawData.value.topic.findIndex(t => t.guid === topicGuid);

      if (rawTopicIndex !== -1 && Array.isArray(rawData.value.topic[rawTopicIndex].comments)) {
        const rawCommentIndex = rawData.value.topic[rawTopicIndex].comments.findIndex(c => c.date === comment.time && c.by === comment.byGuid);

        if (rawCommentIndex !== -1) {
          rawData.value.topic[rawTopicIndex].comments[rawCommentIndex] = {
            comment: comment.text,
            date: comment.time,
            by: comment.byGuid
          };
        }
      }
    }

    saveDataToStorage();
  }
};

const handleDeleteComment = (payload) => {
  const { comment, index, topicGuid } = payload;
  const topicIndex = topics.value.findIndex(t => t.guid === topicGuid);
  if (topicIndex === -1) return;

  const updatedComments = [...topics.value[topicIndex].comments];
  updatedComments.splice(index, 1);
  topics.value[topicIndex] = {
    ...topics.value[topicIndex],
    comments: updatedComments
  };

  if (rawData.value && Array.isArray(rawData.value.topic)) {
    const rawTopicIndex = rawData.value.topic.findIndex(t => t.guid === topicGuid);

    if (rawTopicIndex !== -1 && Array.isArray(rawData.value.topic[rawTopicIndex].comments)) {
      const rawCommentIndex = rawData.value.topic[rawTopicIndex].comments.findIndex(
        c => c.date === comment.time && c.by === comment.byGuid
      );

      if (rawCommentIndex !== -1) {
        rawData.value.topic[rawTopicIndex].comments.splice(rawCommentIndex, 1);
      }
    }
  }

  saveDataToStorage();
};
</script>