/**
 * RESPONSIBILITY: Canonical Route Registry exposing top-level navigation routes (Rule 4, Section 948).
 * FLOW: Re-exports CORE_ROUTES and type definitions from routes.ts for seamless architecture alignment.
 */

export {
  CORE_ROUTES,
  ROUTES,
  type CoreRouteKey,
  type CoreRouteName,
  type RootDrawerParamList,
} from './routes';
