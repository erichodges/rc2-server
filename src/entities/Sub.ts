import {
  BeforeInsert,
  Column,
  Entity as TOEntity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { makeId, slugify } from '../util/helpers';

import Entity from './Entity';
import Post from './Post';
import User from './User';

@TOEntity('subs')
export default class Sub extends Entity {
  constructor(sub: Partial<Sub>) {
    super();
    Object.assign(this, sub);
  }

  @Index()
  @Column({ unique: true })
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrn: string; // Urn = unique resource name

  @Column({ nullable: true })
  bannerUrn: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @OneToMany(() => Post, (post) => post.sub)
  posts: Post[];
}