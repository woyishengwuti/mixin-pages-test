const Home = (resolve) => require(['@test2/views/Home.vue'], resolve);
const About = (resolve) => require(['@test2/views/About.vue'], resolve);

export default [
  {
    path: '/',
    redirect: '/test2-home'
  },
  {
    path: '/test2-home',
    name: 'home',
    component: Home
  },
  {
    path: '/test2-about',
    name: 'about',
    component: About
  }
]
