<template>
  <div class="mt-2">
    <h4 class="text-md font-medium text-gray-800">
      {{ comments.length }} {{ comments.length === 1 ? 'Comment' : 'Comments' }}
    </h4>

    <!-- Comment editing form -->
    <CommentForm v-if="showCommentForm || editingComment" :comment="editingComment" :topic-guid="topicGuid"
      @submit="handleCommentSubmit" @cancel="cancelCommentEdit" />

    <button v-else @click="showCommentForm = true"
      class="mt-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Add a comment
    </button>

    <!-- Comments list -->
    <ul v-if="comments.length > 0" class="mt-4 space-y-4">
      <li v-for="(comment, index) in comments" :key="`comment-${index}`"
        class="pl-4 border-l-2 border-gray-200 relative group">
        <p class="text-gray-700">{{ comment.text }}</p>
        <div class="mt-1 text-sm text-gray-500">
          <span>Comment by {{ comment.by }} on {{ formatDate(comment.time) }}</span>
        </div>

        <!-- Comment actions (edit/delete) -->
        <div class="absolute top-0 right-0 hidden group-hover:flex space-x-1">
          <button @click="editComment(comment)" class="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            title="Edit comment">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button @click="deleteComment(comment, index)" class="p-1 text-red-600 hover:text-red-800 focus:outline-none"
            title="Delete comment">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </li>
    </ul>
    <p v-else-if="!showCommentForm" class="mt-2 text-sm text-gray-500 italic">No comments yet</p>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import CommentForm from './CommentForm.vue';

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  topicGuid: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['comment-update', 'comment-add', 'comment-delete']);
const showCommentForm = ref(false);
const editingComment = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';

  try {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

const editComment = (comment) => {
  editingComment.value = { ...comment };
  showCommentForm.value = false;
};

const cancelCommentEdit = () => {
  editingComment.value = null;
  showCommentForm.value = false;
};

const handleCommentSubmit = (payload) => {
  if (payload.action === 'create') {
    emit('comment-add', payload);
  } else if (payload.action === 'update') {
    emit('comment-update', payload);
  }

  editingComment.value = null;
  showCommentForm.value = false;
};

const deleteComment = (comment, index) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    emit('comment-delete', {
      comment,
      index,
      topicGuid: props.topicGuid
    });
  }
};
</script>

<style scoped>
.group:hover .group-hover\:flex {
  display: flex;
}
</style>