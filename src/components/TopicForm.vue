<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  topic: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['save', 'cancel']);

// Local form state
const form = ref({
  guid: null,
  name: '',
  by: 'Current User',
  time: new Date().toISOString()
});

const resetForm = () => {
  form.value = {
    guid: null,
    name: '',
    by: 'Current User',
    time: new Date().toISOString()
  };
};

watch(
  () => props.topic,
  (newTopic) => {
    if (newTopic) {
      form.value = { ...newTopic };
    } else {
      resetForm();
    }
  },
  { immediate: true } 
);

// Computed property to determine if we're editing
const isEditing = computed(() => !!form.value.guid);

// Save or update topic
const saveTopic = () => {
  form.value.name = form.value.name.trim();
  form.value.time = new Date().toISOString();
  emit('save', { ...form.value });

  if (!isEditing.value) {
    resetForm();
  }
};

const cancelEdit = () => {
  resetForm();
  emit('cancel');
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">
      {{ isEditing ? 'Edit Topic' : 'Create New Topic' }}
    </h2>
    <form @submit.prevent="saveTopic" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter topic title (max 50 characters)"
          required
          maxlength="50"
        />
        <div class="mt-1 text-xs text-gray-500">
          {{ form.name.length }}/50 characters
        </div>
      </div>

      <div class="flex space-x-3">
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {{ isEditing ? 'Update Topic' : 'Create Topic' }}
        </button>

        <button
          v-if="isEditing"
          type="button"
          @click="cancelEdit"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>