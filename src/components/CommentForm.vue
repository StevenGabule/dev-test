<template>
	<div class="mt-4" :class="{ 'bg-blue-50 p-4 rounded-lg': isEditing }">
		<h4 class="text-md font-medium text-gray-800 mb-2">
			{{ isEditing ? 'Edit Comment' : 'Add a Comment' }}
		</h4>

		<form @submit.prevent="submitComment" class="space-y-3">
			<div>
				<textarea v-model="commentText"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Write your comment here..." rows="2" required></textarea>
			</div>

			<div class="flex space-x-2">
				<button type="submit"
					class="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					:disabled="!commentText.trim()">
					{{ isEditing ? 'Update' : 'Add' }} Comment
				</button>

				<button v-if="isEditing" type="button" @click="cancelEdit"
					class="px-4 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
					Cancel
				</button>
			</div>
		</form>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
	comment: {
		type: Object,
		default: () => null
	},
	topicGuid: {
		type: String,
		required: true
	}
});

const emit = defineEmits(['submit', 'cancel']);
const commentText = ref('');
const isEditing = computed(() => !!props.comment);

watch(() => props.comment, (newComment) => {
	if (newComment) {
		commentText.value = newComment.text || '';
	} else {
		commentText.value = '';
	}
}, { immediate: true });

const submitComment = () => {
	if (!commentText.value.trim()) return;

	if (isEditing.value) {
		emit('submit', {
			action: 'update',
			comment: {
				...props.comment,
				text: commentText.value.trim(),
				time: new Date().toISOString()
			},
			topicGuid: props.topicGuid
		});
	} else {
		emit('submit', {
			action: 'create',
			comment: {
				text: commentText.value.trim(),
				by: 'Current User',
				byGuid: 'current-user',
				time: new Date().toISOString()
			},
			topicGuid: props.topicGuid
		});
	}
	commentText.value = '';
};

const cancelEdit = () => {
	commentText.value = '';
	emit('cancel');
};
</script>