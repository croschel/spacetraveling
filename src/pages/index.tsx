import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}
export default function Home(props: HomeProps) {
  const { postsPagination } = props;
  const { results, next_page } = postsPagination;

  const loadMorePosts = () => {};

  return (
    <main className={commonStyles.container}>
      <div className={styles.postsContainer}>
        {results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div className={styles.contentFooter}>
                <div>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                </div>
                <div>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}
        {next_page !== null && (
          <button type="button" onClick={() => {}}>
            Carregar mais posts
          </button>
        )}
      </div>
    </main>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );
  // console.log(JSON.stringify(postsResponse));
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
