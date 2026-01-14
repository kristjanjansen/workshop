<script setup lang="ts">
import { ref, computed } from "vue";
import { useWebSocket } from "@vueuse/core";

const config = useRuntimeConfig();
const userId = ref(`user_${Math.random().toString(36).substring(2, 9)}`);
const message = ref("");
const messages = ref<Array<{ value: string; userId: string; timestamp: Date }>>(
  []
);

const { status, data, send, open, close } = useWebSocket(
  config.public.wsServer,
  {
    autoReconnect: true,
    heartbeat: {
      message: "ping",
      interval: 30000,
    },
    onMessage: (ws, event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "WORKSHOP_CHAT") {
          messages.value.push({
            value: payload.value,
            userId: payload.userId,
            timestamp: new Date(payload.timestamp),
          });
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    },
  }
);

const sendMessage = () => {
  if (!message.value.trim()) return;

  const payload = {
    value: message.value,
    type: "WORKSHOP_CHAT",
    userId: userId.value,
    timestamp: new Date(),
  };

  send(JSON.stringify(payload));
  message.value = "";
};

const statusColor = computed(() => {
  switch (status.value) {
    case "OPEN":
      return "bg-green-500";
    case "CONNECTING":
      return "bg-yellow-500";
    case "CLOSED":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div class="p-4 border-b flex items-center justify-between">
        <h1 class="text-xl font-bold">Chat</h1>
        <div class="flex items-center gap-2">
          <div :class="['w-3 h-3 rounded-full', statusColor]"></div>
          <span class="text-sm text-gray-600">{{ status }}</span>
        </div>
      </div>

      <div class="h-96 overflow-y-auto p-4 space-y-2">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="[
            'p-3 rounded-lg max-w-xs',
            msg.userId === userId
              ? 'ml-auto bg-blue-500 text-white'
              : 'bg-gray-200',
          ]"
        >
          <div class="text-xs opacity-75 mb-1">{{ msg.userId }}</div>
          <div>{{ msg.value }}</div>
          <div class="text-xs opacity-75 mt-1">
            {{ new Date(msg.timestamp).toLocaleTimeString() }}
          </div>
        </div>
      </div>

      <div class="p-4 border-t">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="message"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            :disabled="!message.trim() || status !== 'OPEN'"
          >
            Send
          </button>
        </form>
        <div class="text-xs text-gray-500 mt-2">Your ID: {{ userId }}</div>
      </div>
    </div>
  </div>
</template>
