# TypeScript 'any' Type Analysis Report

Found 189 instances of 'any' type in 68 files.

## __mocks__\mongoose.ts

Line 8: `definition: any;`
Suggested replacement: `unknown`

Line 9: `options: any;`
Suggested replacement: `unknown`

Line 15: `index(fields: { [key: string]: number }, options?: { [key: string]: any }): ISchema;`
Suggested replacement: `unknown`

Line 18: `function Schema(this: ISchema, definition: any, options: any = {}) {`
Suggested replacement: `unknown`

Line 20: `return new (Schema as any)(definition, options);`
Suggested replacement: `unknown`

Line 58: `Schema.prototype.index = function(this: ISchema, fields: { [key: string]: number }, options: { [key: string]: any } = {}) {`
Suggested replacement: `unknown`

Line 92: `Schema: Schema as any,`
Suggested replacement: `unknown`


## __tests__\auth\api-auth.test.ts

Line 59: `// If roles are required, check if user has any of the required roles`
Suggested replacement: `unknown`


## __tests__\e2e\csp-violations.test.ts

Line 25: `let cspViolations: any[] = [];`
Suggested replacement: `    let cspViolations: unknown[] = [];`


## __tests__\manifest-validation.test.ts

Line 6: `let manifestJson: any;`
Suggested replacement: `unknown`

Line 30: `manifestJson.icons.forEach((icon: any) => {`
Suggested replacement: `unknown`

Line 48: `manifestJson.shortcuts.forEach((shortcut: any) => {`
Suggested replacement: `unknown`

Line 53: `shortcut.icons.forEach((icon: any) => {`
Suggested replacement: `unknown`


## __tests__\performance.test.tsx

Line 70: `(global as any).PerformanceObserver = class {`
Suggested replacement: `unknown`


## __tests__\seo.test.tsx

Line 44: `const og = metadata.openGraph as any;`
Suggested replacement: `unknown`

Line 52: `const twitter = metadata.twitter as any;`
Suggested replacement: `unknown`

Line 58: `const robots = metadata.robots as any;`
Suggested replacement: `unknown`


## scripts\fix-any-types.ts

Line 36: `'data: any': 'data: JsonValue',`
Suggested replacement: `  'data: JsonValue': 'data: JsonValue',`

Line 37: `'response: any': 'response: JsonValue',`
Suggested replacement: `  'response: JsonValue': 'response: JsonValue',`

Line 38: `'result: any': 'result: JsonValue',`
Suggested replacement: `  'result: JsonValue': 'result: JsonValue',`

Line 39: `'json: any': 'json: JsonValue',`
Suggested replacement: `  'json: JsonValue': 'json: JsonValue',`

Line 42: `'error: any': 'error: unknown',`
Suggested replacement: `  'error: unknown': 'error: unknown',`

Line 43: `'catch (error: any)': 'catch (error: unknown)',`
Suggested replacement: `  'catch (error: unknown)': 'catch (error: unknown)',`

Line 44: `'catch (err: any)': 'catch (err: unknown)',`
Suggested replacement: `  'catch (err: unknown)': 'catch (err: unknown)',`

Line 45: `'catch (e: any)': 'catch (e: unknown)',`
Suggested replacement: `  'catch (e: unknown)': 'catch (e: unknown)',`

Line 48: `'event: any': 'event: Event',`
Suggested replacement: `  'event: Event': 'event: Event',`

Line 49: `'e: any': 'e: Event',`
Suggested replacement: `  'e: Event': 'e: Event',`

Line 52: `'props: any': 'props: React.PropsWithChildren<unknown>',`
Suggested replacement: `  'props: React.PropsWithChildren<unknown>': 'props: React.PropsWithChildren<unknown>',`

Line 53: `'Component<any>': 'Component<React.PropsWithChildren<unknown>>',`
Suggested replacement: `  'Component<React.PropsWithChildren<unknown>>': 'Component<React.PropsWithChildren<unknown>>',`

Line 57: `': (...args: any[]) => any': ': (...args: unknown[]) => unknown',`
Suggested replacement: `  ': (...args: unknown[]) => unknown': ': (...args: unknown[]) => unknown',`

Line 62: `'Array<any>': 'unknown[]',`
Suggested replacement: `  'unknown[]': 'unknown[]',`

Line 66: `'message: any': 'message: MessageData',`
Suggested replacement: `  'message: Event': 'message: MessageData',`

Line 67: `'msg: any': 'msg: MessageData',`
Suggested replacement: `  'msg: MessageData': 'msg: MessageData',`

Line 103: `if (line.includes(': any') || line.includes('<any>') || line.includes(' any[]') || line.includes('as any')) {`
Suggested replacement: `          if (line.includes(': any') || line.includes('<any>') || line.includes(' unknown[]') || line.includes('as any')) {`


## src\app\_hooks\useSWRFetch.ts

Line 15: `(error as any).info = await response.json();`
Suggested replacement: `unknown`

Line 16: `(error as any).status = response.status;`
Suggested replacement: `unknown`

Line 75: `{ arg }: { arg: { method: string; body?: any; headers?: HeadersInit; url?: string } }`
Suggested replacement: `unknown`

Line 92: `(error as any).info = await response.json();`
Suggested replacement: `unknown`

Line 93: `(error as any).status = response.status;`
Suggested replacement: `unknown`

Line 122: `options?: SWRMutationConfiguration<Data, Error, string, { method: string; body?: any; headers?: HeadersInit; url?: string }>`
Suggested replacement: `unknown`

Line 123: `): SWRMutationResponse<Data, Error, string, { method: string; body?: any; headers?: HeadersInit; url?: string }> {`
Suggested replacement: `unknown`

Line 124: `return useSWRMutation<Data, Error, string, { method: string; body?: any; headers?: HeadersInit; url?: string }>(`
Suggested replacement: `unknown`

Line 148: `updatedItem: Partial<T> & { [key: string]: any },`
Suggested replacement: `unknown`


## src\app\admin\debug\page.tsx

Line 14: `const [flowResults, setFlowResults] = useState<any>(null);`
Suggested replacement: `unknown`


## src\app\admin\users\page.tsx

Line 71: `setUsers(usersList.map((user: any) => ({`
Suggested replacement: `unknown`


## src\app\api\admin\routines\archived\route.ts

Line 47: `const transformedRoutines = archivedRoutines.map((routine: any) => ({`
Suggested replacement: `    const transformedRoutines = archivedRoutines.map((routine: Event) => ({`


## src\app\api\admin\users\route.ts

Line 56: `const query: any = {};`
Suggested replacement: `unknown`


## src\app\api\coach\[coachId]\route.ts

Line 56: `const user = session.user as any;`
Suggested replacement: `unknown`

Line 80: `} catch (error: any) {`
Suggested replacement: `  } catch (error: unknown) {`

Line 100: `const user = session.user as any;`
Suggested replacement: `unknown`

Line 139: `} catch (error: any) {`
Suggested replacement: `  } catch (error: unknown) {`


## src\app\api\coach\route.ts

Line 82: `} catch (error: any) {`
Suggested replacement: `  } catch (error: unknown) {`


## src\app\api\debug\roles\route.ts

Line 24: `let dbUser: any = null;`
Suggested replacement: `unknown`


## src\app\api\seed\route.ts

Line 31: `const user: any = {`
Suggested replacement: `unknown`


## src\app\api\workouts\route.ts

Line 57: `} catch (error: any) {`
Suggested replacement: `  } catch (error: unknown) {`


## src\app\debug\admin-access\page.tsx

Line 11: `const [serverRoles, setServerRoles] = useState<any>(null);`
Suggested replacement: `unknown`


## src\app\debug\auth\page.tsx

Line 9: `const [serverRoles, setServerRoles] = useState<any>(null);`
Suggested replacement: `unknown`


## src\app\debug\redirects\page.tsx

Line 9: `const [analysis, setAnalysis] = useState<any>(null);`
Suggested replacement: `unknown`

Line 62: `{analysis.mostFrequentSources.map((source: any, index: number) => (`
Suggested replacement: `                {analysis.mostFrequentSources.map((source: Event, index: number) => (`

Line 77: `{analysis.potentialLoops.map((loop: any, index: number) => (`
Suggested replacement: `unknown`


## src\app\debug\session\page.tsx

Line 13: `const [stats, setStats] = useState<any>(null);`
Suggested replacement: `unknown`

Line 14: `const [sessionData, setSessionData] = useState<any>(null);`
Suggested replacement: `unknown`


## src\app\sitemap.ts

Line 52: `const workoutRoutes = workouts.map((workout: any) => ({`
Suggested replacement: `unknown`


## src\app\workout\__tests__\WorkoutPageTest.tsx

Line 11: `const WorkoutList = ({ workouts }: { workouts: any[] }) => (`
Suggested replacement: `const WorkoutList = ({ workouts }: { workouts: unknown[] }) => (`


## src\app\workout\[id]\actions.ts

Line 316: `workoutId: workout.id || (workout as any)._id?.toString(),`
Suggested replacement: `unknown`

Line 348: `workoutId: workout.id || (workout as any)._id?.toString(),`
Suggested replacement: `unknown`

Line 476: `workoutData.days = workoutData.days.map((day: any) => {`
Suggested replacement: `unknown`

Line 490: `newDay.blocks = (newDay.blocks || []).map((block: any) => {`
Suggested replacement: `unknown`

Line 504: `newBlock.exercises = (newBlock.exercises || []).map((exercise: any) => {`
Suggested replacement: `        newBlock.exercises = (newBlock.exercises || []).map((exercise: Event) => {`


## src\app\workout\[id]\opengraph-image.tsx

Line 106: `(count: number, day: any) =>`
Suggested replacement: `unknown`

Line 108: `(blockCount: number, block: any) =>`
Suggested replacement: `unknown`


## src\app\workout\[id]\page.tsx

Line 35: `const workoutDoc = await getWorkout(id, session.user.id) as any;`
Suggested replacement: `unknown`

Line 54: `days: (workoutDoc.days || []).map((day: any) => {`
Suggested replacement: `unknown`

Line 64: `blocks: (day.blocks || []).map((block: any) => {`
Suggested replacement: `unknown`

Line 74: `exercises: (block.exercises || []).map((exercise: any) => {`
Suggested replacement: `            exercises: (block.exercises || []).map((exercise: Event) => {`

Line 147: `const workoutData = workout as any;`
Suggested replacement: `unknown`


## src\app\workout\new\page.tsx

Line 45: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`


## src\app\workout\page.tsx

Line 37: `days: any[];`
Suggested replacement: `  days: unknown[];`


## src\app\workout\workout-actions.ts

Line 74: `workoutData.days = workoutData.days.map((day: any) => {`
Suggested replacement: `unknown`

Line 88: `newDay.blocks = (newDay.blocks || []).map((block: any) => {`
Suggested replacement: `unknown`

Line 102: `newBlock.exercises = (newBlock.exercises || []).map((exercise: any) => {`
Suggested replacement: `        newBlock.exercises = (newBlock.exercises || []).map((exercise: Event) => {`


## src\components\admin\AdminDashboard.tsx

Line 164: `setUsers(usersList.map((user: any) => ({`
Suggested replacement: `unknown`

Line 303: `const coachDoc = coachesData.find((c: any) =>`
Suggested replacement: `unknown`

Line 512: `const coachDoc = coachesData.find((c: any) =>`
Suggested replacement: `unknown`


## src\components\admin\DeleteUserModal.tsx

Line 11: `onConfirm: () => Promise<any>;`
Suggested replacement: `unknown`


## src\components\admin\EditUserModal.tsx

Line 21: `onConfirm: (data: { name: string; email: string; roles: string[] }) => void | Promise<any>;`
Suggested replacement: `unknown`


## src\components\debug\PerformanceDebug.tsx

Line 81: `if ((performance as any).memory) {`
Suggested replacement: `unknown`

Line 82: `const memory = (performance as any).memory;`
Suggested replacement: `unknown`


## src\components\DebugRenderCounter.tsx

Line 18: `const handleConsoleLog = useCallback(function(...args: any[]) {`
Suggested replacement: `  const handleConsoleLog = useCallback(function(...args: unknown[]) {`


## src\components\IntersectionObserver.tsx

Line 120: `const observer = new (window.IntersectionObserver as any)(handleIntersection, {`
Suggested replacement: `unknown`

Line 150: `<Component className={className} id={id} style={style} ref={forwardedRef as any}>`
Suggested replacement: `unknown`

Line 159: `<Component className={className} id={id} style={style} ref={forwardedRef as any}>`
Suggested replacement: `unknown`

Line 167: `<Component className={className} id={id} style={style} ref={forwardedRef as any}>`
Suggested replacement: `unknown`


## src\components\LazyComponent.tsx

Line 6: `importFn: () => Promise<{ default: ComponentType<any> }>;`
Suggested replacement: `unknown`

Line 28: `const [Component, setComponent] = useState<ComponentType<any> | null>(null);`
Suggested replacement: `unknown`


## src\components\modals\AssignWorkoutModal.tsx

Line 23: `onAssign: (data: { coachIds: string[]; customerIds: string[] }) => Promise<any>;`
Suggested replacement: `unknown`

Line 68: `const normalizedUsers = data.map((user: any) => ({`
Suggested replacement: `unknown`


## src\components\modals\DuplicateWorkoutModal.tsx

Line 14: `onDuplicate: (newName: string, newDescription: string, workoutId: string) => Promise<any>;`
Suggested replacement: `unknown`


## src\components\modals\RenameWorkoutModal.tsx

Line 14: `onRename: (workoutId: string, newName: string, newDescription: string) => Promise<any>;`
Suggested replacement: `unknown`


## src\components\modout\AssignWorkoutModal.tsx

Line 7: `onAssign: (data: { coachIds: string[]; customerIds: string[] }) => Promise<any>;`
Suggested replacement: `unknown`


## src\components\NavigationPatcher.tsx

Line 23: `let pendingReplaceState: any = null;`
Suggested replacement: `    let pendingReplaceState: Event = null;`

Line 24: `let pendingPushState: any = null;`
Suggested replacement: `    let pendingPushState: Event = null;`


## src\components\NavigationTracker.tsx

Line 8: `function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {`
Suggested replacement: `function debounce<T extends (...args: unknown[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {`

Line 10: `return function(this: any, ...args: Parameters<T>): void {`
Suggested replacement: `unknown`


## src\components\PerformanceMonitor.tsx

Line 60: `if ('attribution' in entry && Array.isArray((entry as any).attribution)) {`
Suggested replacement: `unknown`

Line 61: `const attribution = (entry as any).attribution[0];`
Suggested replacement: `unknown`

Line 109: `(window as any).trackPerformance = {`
Suggested replacement: `unknown`

Line 140: `delete (window as any).trackPerformance;`
Suggested replacement: `unknown`


## src\components\workout\CreateRoutineForm.tsx

Line 135: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`


## src\components\workout\ExerciseCard.tsx

Line 89: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`


## src\components\workout\WorkoutClient.tsx

Line 56: `addDay: (workoutId: string, userId: string) => Promise<any>;`
Suggested replacement: `unknown`

Line 57: `addBlock: (workout: Workout, dayIndex: number) => Promise<any>;`
Suggested replacement: `unknown`

Line 58: `addExercise: (workout: Workout, dayIndex: number, blockIndex: number) => Promise<any>;`
Suggested replacement: `unknown`

Line 59: `updateExercise: (workout: Workout, dayIndex: number, blockIndex: number, exerciseIndex: number, data: Partial<Exercise>) => Promise<any>;`
Suggested replacement: `unknown`

Line 60: `deleteExercise: (workout: Workout, dayIndex: number, blockIndex: number, exerciseIndex: number) => Promise<any>;`
Suggested replacement: `unknown`

Line 61: `deleteBlock: (workout: Workout, dayIndex: number, blockIndex: number) => Promise<any>;`
Suggested replacement: `unknown`

Line 62: `deleteDay: (workout: Workout, dayIndex: number) => Promise<any>;`
Suggested replacement: `unknown`

Line 63: `deleteWorkout: (workoutId: string, userId: string) => Promise<any>;`
Suggested replacement: `unknown`

Line 64: `updateDayName?: (workout: Workout, dayIndex: number, newName: string) => Promise<any>;`
Suggested replacement: `unknown`

Line 65: `updateBlockName?: (workout: Workout, dayIndex: number, blockIndex: number, newName: string) => Promise<any>;`
Suggested replacement: `unknown`

Line 143: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`

Line 168: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`

Line 187: `const handleUpdateExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number, data: any) => {`
Suggested replacement: `  const handleUpdateExercise = async (dayIndex: number, blockIndex: number, exerciseIndex: number, data: JsonValue) => {`

Line 303: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`

Line 322: `} catch (error: any) {`
Suggested replacement: `    } catch (error: unknown) {`


## src\components\workout\WorkoutItem.tsx

Line 12: `days?: any[];`
Suggested replacement: `  days?: unknown[];`


## src\contexts\AuthContext.tsx

Line 129: `// Check if the user has any of the specified roles`
Suggested replacement: `unknown`


## src\hooks\useLoadingSpinner.ts

Line 31: `<T extends any[], R>(fn: (...args: T) => Promise<R>) => {`
Suggested replacement: `    <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => {`


## src\lib\db.ts

Line 98: `const operation = (this as any).op || 'unknown';`
Suggested replacement: `unknown`

Line 101: `const hasHint = !!(this as any)._hint;`
Suggested replacement: `unknown`

Line 114: `} else if (filter.$or && filter.$or.some((cond: any) => cond.email || cond.sub)) {`
Suggested replacement: `unknown`

Line 121: `queryType = operation === 'find' && (this as any).options?.sort?.createdAt === -1`
Suggested replacement: `unknown`

Line 138: `return originalExec.apply(this, arguments as any).then((result: any) => {`
Suggested replacement: `    return originalExec.apply(this, arguments as any).then((result: JsonValue) => {`


## src\lib\db\indexes.ts

Line 18: `[key: string]: any;`
Suggested replacement: `unknown`

Line 80: `await collection.createIndex(index.fields, index.options as any);`
Suggested replacement: `unknown`


## src\lib\services\coach.ts

Line 71: `_id: (coachDoc.userId as any)._id?.toString() || ''`
Suggested replacement: `unknown`

Line 73: `: (coachDoc.userId as any)?.toString() || '',`
Suggested replacement: `unknown`

Line 77: `? coachDoc.customers.map((customer: any) => ({`
Suggested replacement: `unknown`

Line 126: `_id: (coachDoc.userId as any)._id?.toString() || ''`
Suggested replacement: `unknown`

Line 128: `: (coachDoc.userId as any)?.toString() || '',`
Suggested replacement: `unknown`

Line 132: `? coachDoc.customers.map((customer: any) => ({`
Suggested replacement: `unknown`

Line 171: `_id: (coachDoc.userId as any)._id?.toString() || ''`
Suggested replacement: `unknown`

Line 173: `: (coachDoc.userId as any)?.toString() || '',`
Suggested replacement: `unknown`

Line 177: `? coachDoc.customers.map((customer: any) => ({`
Suggested replacement: `unknown`


## src\lib\services\workout.ts

Line 19: `[key: string]: any;`
Suggested replacement: `unknown`

Line 140: `userId: typeof doc.userId === 'string' ? doc.userId : (doc.userId as any).toString(),`
Suggested replacement: `unknown`

Line 179: `[key: string]: any;`
Suggested replacement: `unknown`

Line 235: `const coachData = coach as any;`
Suggested replacement: `unknown`

Line 369: `const coachData = coach as any;`
Suggested replacement: `unknown`

Line 375: `console.log(`[DEBUG] Clientes del coach:`, coachData.customers.map((c: any) => c.toString()));`
Suggested replacement: `unknown`

Line 379: `(customerId: any) => customerId && customerId.toString() === studentUserId`
Suggested replacement: `unknown`

Line 649: `workout.assignedCustomers.some((customerId: any) =>`
Suggested replacement: `unknown`

Line 656: `workout.assignedCoaches.some((coachId: any) =>`
Suggested replacement: `unknown`


## src\lib\services\workout\getWorkouts.ts

Line 40: `function transformMongoWorkout(workout: any) {`
Suggested replacement: `unknown`


## src\lib\storage.ts

Line 178: `return Array.from((MemoryStorage as any).store?.keys() || []);`
Suggested replacement: `unknown`

Line 201: `return !!(MemoryStorage as any).store?.has(key);`
Suggested replacement: `unknown`


## src\lib\test\api-test.ts

Line 13: `data?: any;`
Suggested replacement: `unknown`

Line 147: `const coachDoc = coachesTest.data.find((c: any) =>`
Suggested replacement: `unknown`


## src\lib\types\workout.ts

Line 8: `[key: string]: any;`
Suggested replacement: `unknown`


## src\lib\utils\api-error-handler.ts

Line 22: `details?: any;`
Suggested replacement: `unknown`

Line 99: `details?: any`
Suggested replacement: `unknown`

Line 100: `): Error & { code: string; details?: any } {`
Suggested replacement: `unknown`

Line 101: `const error = new Error(message) as Error & { code: string; details?: any };`
Suggested replacement: `unknown`


## src\lib\utils\compression.ts

Line 16: `data: any,`
Suggested replacement: `  data: JsonValue, `

Line 60: `data: any,`
Suggested replacement: `  data: JsonValue,`


## src\lib\utils\debugLogger.ts

Line 8: `data?: any;`
Suggested replacement: `unknown`

Line 10: `session?: any;`
Suggested replacement: `unknown`


## src\lib\utils\permissions.ts

Line 15: `days: any[];`
Suggested replacement: `  days: unknown[];`

Line 27: `[key: string]: any;`
Suggested replacement: `unknown`

Line 33: `let user: any = null;`
Suggested replacement: `unknown`

Line 65: `export function hasRole(user: any, role: string): boolean {`
Suggested replacement: `unknown`

Line 78: `* Checks if a user has any of the specified roles`
Suggested replacement: `unknown`

Line 81: `* @returns true if user has any of the roles, false otherwise`
Suggested replacement: `unknown`

Line 83: `export function hasAnyRole(user: any, roles: string[]): boolean {`
Suggested replacement: `unknown`

Line 261: `const customerIds = newCoach.customers.map((customer: any) =>`
Suggested replacement: `unknown`


## src\lib\utils\schema.ts

Line 92: `export function generateWorkoutSchema(workout: any) {`
Suggested replacement: `unknown`

Line 128: `export function generatePersonSchema(person: any) {`
Suggested replacement: `unknown`

Line 147: `export function generateExerciseSchema(exercise: any) {`
Suggested replacement: `export function generateExerciseSchema(exercise: Event) {`


## src\lib\utils\transformers.ts

Line 68: `export function transformMongoWorkout(doc: MongoWorkout): any {`
Suggested replacement: `unknown`


## src\lib\websocket-manager.ts

Line 16: `lastMessage?: any;`
Suggested replacement: `unknown`


## src\utils\authNavigation.ts

Line 171: `export function createSessionFromToken(token: any): Session | null {`
Suggested replacement: `unknown`


## src\utils\debounce.ts

Line 9: `export function debounce<T extends (...args: any[]) => any>(`
Suggested replacement: `export function debounce<T extends (...args: unknown[]) => any>(`


## src\utils\lazyComponents.ts

Line 8: `export function lazyLoad<T extends ComponentType<any>>(`
Suggested replacement: `unknown`

Line 31: `(LazyComponent as any).displayName = `Lazy(${fallback})`;`
Suggested replacement: `unknown`

Line 41: `export function lazyLoadWithDelay<T extends ComponentType<any>>(`
Suggested replacement: `unknown`


## src\utils\sessionCache.ts

Line 31: `private cache: any = null;`
Suggested replacement: `  private cache: Event = null;`

Line 33: `private pendingPromise: Promise<any> | null = null;`
Suggested replacement: `unknown`

Line 193: `async getSession(): Promise<any> {`
Suggested replacement: `unknown`

Line 271: `updateCache(data: any): void {`
Suggested replacement: `  updateCache(data: JsonValue): void {`


