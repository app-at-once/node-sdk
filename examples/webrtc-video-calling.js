const { AppAtOnceClient } = require('../dist');

// Initialize the client
const client = new AppAtOnceClient('your-api-key-here');

/**
 * Complete WebRTC Video Calling Example
 * This example demonstrates all major features of the WebRTC module
 */

// 1. Create a Video Session
async function createVideoSession() {
  try {
    const session = await client.webrtc.createSession({
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      type: 'instant',
      maxParticipants: 10,
      settings: {
        enableRecording: true,
        enableTranscription: true,
        enableChat: true,
        enableScreenShare: true,
        enableVirtualBackground: false,
        waitingRoom: false,
        muteOnJoin: true,
        requirePermissionToUnmute: false,
      },
      features: ['recording', 'transcription', 'chat', 'screen-share'],
    });

    console.log('Video session created:', session);
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// 2. List Active Sessions
async function listActiveSessions() {
  try {
    const response = await client.webrtc.listSessions({
      status: 'active',
      limit: 10,
      offset: 0,
    });

    console.log(`Found ${response.total} sessions`);
    response.sessions.forEach(session => {
      console.log(`- ${session.title} (${session.id}): ${session.status}`);
    });

    return response.sessions;
  } catch (error) {
    console.error('Error listing sessions:', error);
    throw error;
  }
}

// 3. Join a Video Session
async function joinVideoSession(sessionId, userName) {
  try {
    const joinResponse = await client.webrtc.joinSession(sessionId, {
      name: userName,
      role: 'participant',
      deviceInfo: {
        type: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        version: '120.0',
      },
    });

    console.log('Joined session successfully');
    console.log('Participant ID:', joinResponse.participantId);
    console.log('Connection ID:', joinResponse.connectionId);
    
    // The server handles the WebRTC connection internally
    // Just call startVideoCall to begin
    await client.webrtc.startVideoCall(sessionId);
    
    return joinResponse;
  } catch (error) {
    console.error('Error joining session:', error);
    throw error;
  }
}

// 4. Manage Participants
async function manageParticipants(sessionId) {
  try {
    // Get all participants
    const participants = await client.webrtc.getParticipants(sessionId);
    console.log('Current participants:', participants.length);

    participants.forEach(participant => {
      console.log(`- ${participant.name} (${participant.identity}): ${participant.role}`);
    });

    // Update participant permissions
    if (participants.length > 0) {
      const participant = participants[0];
      await client.webrtc.updateParticipantPermissions(
        sessionId,
        participant.identity,
        {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canPublishSources: ['camera', 'microphone', 'screen'],
        }
      );
      console.log('Updated permissions for:', participant.name);
    }

    return participants;
  } catch (error) {
    console.error('Error managing participants:', error);
    throw error;
  }
}

// 5. Start and Stop Recording
async function manageRecording(sessionId) {
  try {
    // Start recording
    const recording = await client.webrtc.startRecording(sessionId, {
      audioOnly: false,
      videoOnly: false,
      resolution: '1080p',
      audioBitrate: 128000,
      videoBitrate: 4000000,
    });

    console.log('Recording started:', recording.recordingId);

    // Simulate recording for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Stop recording
    const stoppedRecording = await client.webrtc.stopRecording(
      sessionId,
      recording.recordingId
    );

    console.log('Recording stopped:', stoppedRecording.status);

    // Wait for recording to complete processing
    const completedRecording = await client.webrtc.waitForRecording(
      sessionId,
      recording.recordingId,
      {
        maxWaitTime: 60000, // 1 minute
        pollInterval: 5000, // Check every 5 seconds
      }
    );

    console.log('Recording completed:', completedRecording.fileUrl);
    return completedRecording;
  } catch (error) {
    console.error('Error managing recording:', error);
    throw error;
  }
}

// 6. Generate and Get Transcripts
async function generateTranscripts(sessionId) {
  try {
    // Generate transcripts from recording
    const transcripts = await client.webrtc.generateTranscript(sessionId, {
      language: 'en',
      translateTo: 'es', // Also translate to Spanish
      includeSpeakerLabels: true,
    });

    console.log('Generated transcripts:', transcripts.length);

    transcripts.forEach(transcript => {
      console.log(`[${transcript.startTime}-${transcript.endTime}s]: ${transcript.text}`);
      if (transcript.translation?.es) {
        console.log(`  Spanish: ${transcript.translation.es}`);
      }
    });

    return transcripts;
  } catch (error) {
    console.error('Error generating transcripts:', error);
    throw error;
  }
}

// 7. Send Messages to Participants
async function sendMessageToRoom(sessionId) {
  try {
    // Send a message to all participants
    await client.webrtc.sendMessage(sessionId, {
      type: 'chat',
      text: 'Hello everyone!',
      timestamp: new Date().toISOString(),
    });

    console.log('Message sent to all participants');

    // Send a message to specific participants
    const participants = await client.webrtc.getParticipants(sessionId);
    if (participants.length > 1) {
      await client.webrtc.sendMessage(
        sessionId,
        {
          type: 'private',
          text: 'Private message to host',
          timestamp: new Date().toISOString(),
        },
        [participants[0].identity] // Send only to first participant
      );
      console.log('Private message sent');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// 8. Get Session Analytics
async function getSessionAnalytics(sessionId) {
  try {
    const analytics = await client.webrtc.getAnalytics(sessionId);

    console.log('Session Analytics:');
    console.log('- Total Participants:', analytics.totalParticipants);
    console.log('- Average Duration:', analytics.averageDuration, 'seconds');
    console.log('- Peak Concurrent Users:', analytics.peakConcurrentUsers);
    console.log('- Connection Quality:');
    console.log('  - Excellent:', analytics.qualityMetrics.excellent);
    console.log('  - Good:', analytics.qualityMetrics.good);
    console.log('  - Poor:', analytics.qualityMetrics.poor);
    console.log('- Device Breakdown:');
    console.log('  - Desktop:', analytics.deviceBreakdown.desktop);
    console.log('  - Mobile:', analytics.deviceBreakdown.mobile);
    console.log('  - Tablet:', analytics.deviceBreakdown.tablet);

    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
}

// 9. Scheduled Meeting Example
async function createScheduledMeeting() {
  try {
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + 24); // Schedule for tomorrow

    const session = await client.webrtc.createSession({
      title: 'Product Demo',
      description: 'Customer product demonstration',
      type: 'scheduled',
      maxParticipants: 5,
      scheduledAt: scheduledTime,
      settings: {
        enableRecording: true,
        waitingRoom: true,
        muteOnJoin: true,
      },
    });

    console.log('Scheduled meeting created for:', session.scheduledAt);
    return session;
  } catch (error) {
    console.error('Error creating scheduled meeting:', error);
    throw error;
  }
}

// 10. Webinar/Broadcast Example
async function createWebinar() {
  try {
    const session = await client.webrtc.createSession({
      title: 'Tech Talk: WebRTC at Scale',
      description: 'Learn how to build scalable WebRTC applications',
      type: 'webinar',
      maxParticipants: 100,
      settings: {
        enableRecording: true,
        enableChat: true,
        muteOnJoin: true,
        requirePermissionToUnmute: true,
      },
    });

    console.log('Webinar created:', session.id);

    // Join as host
    const hostJoin = await client.webrtc.joinSession(session.id, {
      name: 'John Doe (Host)',
      role: 'host',
    });

    console.log('Host joined with connection ID:', hostJoin.connectionId);
    
    // Start the video call
    await client.webrtc.startVideoCall(session.id);
    return session;
  } catch (error) {
    console.error('Error creating webinar:', error);
    throw error;
  }
}

// 11. Media Control Examples
async function mediaControlExamples(sessionId) {
  try {
    // Toggle audio mute
    await client.webrtc.toggleMedia(sessionId, 'audio', false);
    console.log('Audio muted');
    
    await client.webrtc.toggleMedia(sessionId, 'audio', true);
    console.log('Audio unmuted');
    
    // Toggle video
    await client.webrtc.toggleMedia(sessionId, 'video', false);
    console.log('Video turned off');
    
    await client.webrtc.toggleMedia(sessionId, 'video', true);
    console.log('Video turned on');
    
    // Share screen
    await client.webrtc.shareScreen(sessionId, true);
    console.log('Screen sharing started');
    
    await client.webrtc.shareScreen(sessionId, false);
    console.log('Screen sharing stopped');
  } catch (error) {
    console.error('Error controlling media:', error);
  }
}

// 12. Complete Video Call Flow
async function completeVideoCallFlow() {
  try {
    console.log('=== Complete Video Call Flow Example ===\n');

    // Step 1: Create a session
    console.log('1. Creating video session...');
    const session = await client.webrtc.createSession({
      title: 'Demo Video Call',
      type: 'instant',
      maxParticipants: 4,
      settings: {
        enableRecording: true,
        enableChat: true,
        enableScreenShare: true,
      },
    });
    console.log(`   Session created: ${session.id}\n`);

    // Step 2: Join as host
    console.log('2. Joining as host...');
    const hostJoin = await client.webrtc.joinSession(session.id, {
      name: 'Host User',
      role: 'host',
    });
    console.log(`   Host joined successfully\n`);
    
    // Step 2.5: Start video call
    console.log('2.5. Starting video call...');
    await client.webrtc.startVideoCall(session.id);
    console.log(`   Video call started\n`);

    // Step 3: Simulate participant joining
    console.log('3. Joining as participant...');
    const participantJoin = await client.webrtc.joinSession(session.id, {
      name: 'Participant User',
      role: 'participant',
    });
    console.log(`   Participant joined successfully\n`);

    // Step 4: Get participants
    console.log('4. Getting participants...');
    const participants = await client.webrtc.getParticipants(session.id);
    console.log(`   ${participants.length} participants in session\n`);

    // Step 5: Send a chat message
    console.log('5. Sending chat message...');
    await client.webrtc.sendMessage(session.id, {
      type: 'chat',
      text: 'Welcome to the demo call!',
      sender: 'Host User',
    });
    console.log(`   Message sent\n`);

    // Step 6: Start recording
    console.log('6. Starting recording...');
    const recording = await client.webrtc.startRecording(session.id);
    console.log(`   Recording started: ${recording.recordingId}\n`);

    // Step 7: Simulate call duration
    console.log('7. Call in progress (simulating 5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log(`   Call ongoing...\n`);

    // Step 8: Stop recording
    console.log('8. Stopping recording...');
    await client.webrtc.stopRecording(session.id, recording.recordingId);
    console.log(`   Recording stopped\n`);

    // Step 9: Leave session
    console.log('9. Participants leaving...');
    await client.webrtc.leaveSession(session.id, 'Participant User');
    console.log(`   Participant left\n`);
    
    // Step 9.5: End video call
    console.log('9.5. Ending video call...');
    await client.webrtc.endVideoCall(session.id);
    console.log(`   Video call ended\n`);

    // Step 10: End session
    console.log('10. Ending session...');
    const endedSession = await client.webrtc.endSession(session.id);
    console.log(`    Session ended. Duration: ${endedSession.duration} seconds\n`);

    // Step 11: Get analytics
    console.log('11. Getting session analytics...');
    const analytics = await client.webrtc.getAnalytics(session.id);
    console.log(`    Total participants: ${analytics.totalParticipants}`);
    console.log(`    Average duration: ${analytics.averageDuration}s\n`);

    console.log('=== Video Call Flow Completed Successfully ===');
    return endedSession;
  } catch (error) {
    console.error('Error in video call flow:', error);
    throw error;
  }
}

// 12. Error Handling Example
async function errorHandlingExample() {
  try {
    // Try to join a non-existent session
    await client.webrtc.joinSession('invalid-session-id');
  } catch (error) {
    console.log('Expected error caught:', error.message);
  }

  try {
    // Try to start recording on an ended session
    const session = await client.webrtc.createSession({ title: 'Test' });
    await client.webrtc.endSession(session.id);
    await client.webrtc.startRecording(session.id);
  } catch (error) {
    console.log('Expected error caught:', error.message);
  }
}

// Main execution
async function main() {
  try {
    // Run complete video call flow
    await completeVideoCallFlow();

    // Other examples (uncomment to run):
    // await listActiveSessions();
    // await createScheduledMeeting();
    // await createWebinar();
    // await errorHandlingExample();

  } catch (error) {
    console.error('Main error:', error);
  }
}

// Run the examples
main();

// Export functions for use in other scripts
module.exports = {
  createVideoSession,
  listActiveSessions,
  joinVideoSession,
  manageParticipants,
  manageRecording,
  generateTranscripts,
  sendMessageToRoom,
  getSessionAnalytics,
  createScheduledMeeting,
  createWebinar,
  completeVideoCallFlow,
};