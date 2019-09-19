const Home = (resolve) => require(['@cm/views/Home.vue'], resolve);
const About = (resolve) => require(['@cm/views/About.vue'], resolve);

export default [
  {
    path: '/',
    redirect: '/comm-home'
  },
  {
    path: '/comm-home',
    name: 'home',
    component: Home
  },
  {
    path: '/comm-about',
    name: 'about',
    component: About
  }
]
