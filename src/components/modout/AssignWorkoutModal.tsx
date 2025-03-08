async function handleAssign() {
  try {
    console.log('[Assignment] Starting workout assignment process', {
      workoutId,
      selectedCoaches: selectedCoachIds,
      selectedCustomers: selectedCustomerIds,
      timestamp: new Date().toISOString()
    });

    // ... existing validation code ...

    console.log('[Assignment] Validation passed, starting server assignment', {
      totalCoaches: selectedCoachIds.length,
      totalCustomers: selectedCustomerIds.length,
      firstCustomerId: selectedCustomerIds[0] || 'none'
    });

    const result = await onAssign({
      coachIds: selectedCoachIds,
      customerIds: selectedCustomerIds
    });

    console.log('[Assignment] Server response received', {
      result: {
        success: result?.success,
        assignedCoachesCount: result?.assignedCoaches?.length || 0,
        assignedCustomersCount: result?.assignedCustomers?.length || 0,
        error: result?.error || 'none'
      },
      workoutId,
      timestamp: new Date().toISOString()
    });

    // ... existing verification code ...

    console.log('[Assignment] Assignment verification passed', {
      allAssigned,
      workoutId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Assignment] Critical error during assignment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      workoutId,
      selectedCoaches: selectedCoachIds,
      selectedCustomers: selectedCustomerIds,
      timestamp: new Date().toISOString()
    });
    // ... existing error handling ...
  } finally {
    console.log('[Assignment] Assignment process completed', {
      workoutId,
      success: !error,
      duration: new Date().getTime() - startTime + 'ms'
    });
    setIsAssigning(false);
  }
} 