export const apiService = {
	topicsUrl: 'https://atillc.blob.core.windows.net/data-collector/icode/test-data/topics.json',

	async fetchData() {
		console.log('Fetching data from:', this.topicsUrl);

		try {
			const response = await fetch(this.topicsUrl, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
				},
				cache: 'no-cache'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			console.log(`Successfully fetched data with ${data.topic?.length || 0} topics and ${data.persons?.length || 0} persons`);
			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
			throw new Error(`Failed to fetch data: ${error.message}`);
		}
	},

	processData(data) {
		const personMap = {};

		if (Array.isArray(data.persons)) {
			data.persons.forEach(person => {
				personMap[person.guid] = person;
			});
		}

		const topics = Array.isArray(data.topics) ? data.topics : [];

		return topics.map(topic => {
			const comments = Array.isArray(topic.comments) ? topic.comments : [];
			const processedComments = comments.map(comment => {
				const person = personMap[comment.by] || { name: 'Unknown', first: '', last: '' };
				let personName = person.name;
				if (!personName && person.first) {
					personName = `${person.first} ${person.last}`;
				}

				return {
					text: comment.comment || '',
					time: comment.date || '',
					by: personName || 'Unknown',
					byGuid: comment.by || ''
				};
			});

			return {
				guid: topic.guid || '',
				name: topic.name || '',
				comments: processedComments
			};
		});
	},

	async loadData(forceReload = false) {
		if (!forceReload) {
			try {
				const savedData = localStorage.getItem('topicData');
				if (savedData) {
					const parsedData = JSON.parse(savedData);
					console.log(`Loaded data from localStorage with ${parsedData.topics.length} topics`);
					return {
						...parsedData,
						source: 'localStorage'
					};
				}
			} catch (error) {
				console.error('Error loading from localStorage:', error);
			}
		}

		try {
			const apiData = await this.fetchData();
			const processedTopics = this.processData(apiData);
			const result = {
				topics: processedTopics,
				persons: apiData.persons || [],
				raw: apiData
			};

			localStorage.setItem('topicData', JSON.stringify(result));
			return {
				...result,
				source: 'api'
			};
		} catch (error) {
			try {
				const savedData = localStorage.getItem('topicData');
				if (savedData && forceReload) {
					const parsedData = JSON.parse(savedData);
					console.log(`Falling back to cached data with ${parsedData.topics.length} topics`);
					return {
						...parsedData,
						source: 'localStorage (fallback)'
					};
				}
			} catch (fallbackError) {
				console.error('Fallback to localStorage also failed:', fallbackError);
			}
		}
	},

	getPersonName(person) {
		if (!person) return 'Unknown';

		if (person.name) {
			return person.name;
		}

		if (person.first && person.last) {
			return `${person.first} ${person.last}`;
		}

		return 'Unknown';
	}
};