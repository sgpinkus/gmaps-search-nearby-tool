import { createRouter } from '@sgpinkus/my-vue-router';
import SearchListView from '@/SearchListView.vue';
import SearchQueryView from '@/SearchQueryView.vue';
import SearchResultView from '@/SearchResultView.vue';
import NotFoundPath from '@/NotFoundPath.vue';
import NotFoundResource from '@/NotFoundResource.vue';
import { basePath } from '@/config';

const router = createRouter([
  {
    path: '/',
    name: 'root',
    component: SearchListView,
  },
  {
    path: '/new',
    name: 'new',
    component: SearchQueryView,
  },
  {
    path: '/s/:id',
    name: 'search',
    component: SearchResultView,
  },

  {
    path: '/*pathMatch',
    name: 'not-found',
    component: NotFoundPath,
  },
  {
    path: '/resource-not-found',
    name: 'resource-not-found',
    component: NotFoundResource,
  },
], { installGlobalRef: '$my-vue-router', paramsToProps: true, basePath });

export default router;